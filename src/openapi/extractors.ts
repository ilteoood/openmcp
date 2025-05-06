import type { OpenAPIV3 } from "openapi-types";
import type { ZodType } from "zod";
import { createFromParameter, createFromSchema } from "../schema.js";
import type {
	ExtractedPath,
	ParameterObject,
	ParametersWithRef,
	PathItemObject,
} from "../types.js";

const extractNameFromPath = (path: string) => {
	return path
		.split("/")
		.filter((segment) => segment && !segment.startsWith("{"))
		.join("-");
};

export const basePathItemExtractor = (
	path: string,
	pathItem: PathItemObject,
	method: OpenAPIV3.HttpMethods,
): ExtractedPath => {
	const pathItemMethod = (pathItem as OpenAPIV3.PathItemObject)[method];
	return {
		name: pathItemMethod?.operationId ?? extractNameFromPath(path),
		method,
		path,
		parameters: extractParameters(
			pathItem.parameters,
			pathItemMethod?.parameters,
		),
	};
};

export const extractParameters = (
	pathParameters?: ParametersWithRef,
	methodParameters?: ParametersWithRef,
) => {
	const parameters = (pathParameters ?? []).concat(
		methodParameters ?? [],
	) as ParameterObject[];

	return parameters.reduce<ExtractedPath["parameters"]>(
		(acc, param) => {
			const paramSource = param.in as keyof typeof acc;
			const paramDestination = acc[paramSource];
			paramDestination[param.name] = createFromParameter(param);
			return acc;
		},
		{
			path: {},
			query: {},
			header: {},
			cookie: {},
		},
	);
};

export const requestExtractor = (pathItem: PathItemObject) => {
	return {
		body: extractRequestBody(pathItem),
		formData: extractFormData(pathItem),
	};
};

const extractFormData = (pathItem: PathItemObject) => {
	const formDataParameters = (
		pathItem.post?.parameters as ParameterObject[] | undefined
	)?.filter((param) => param.in === "formData");

	let requestBody: ZodType | undefined;

	if (formDataParameters) {
		requestBody = formDataParameters.reduce(
			bodyParamsReducer,
			{},
		) as unknown as ZodType;
	} else {
		const formDataBody = (
			(pathItem.post as OpenAPIV3.OperationObject)
				?.requestBody as OpenAPIV3.RequestBodyObject
		).content["application/x-www-form-urlencoded"];
		requestBody = formDataBody
			? createFromSchema(formDataBody.schema)
			: undefined;
	}

	return requestBody;
};

const extractRequestBody = (pathItem: PathItemObject) => {
	const bodyParameters = (
		pathItem.post?.parameters as ParameterObject[] | undefined
	)?.filter((param) => param.in === "body");

	let requestBody: ZodType | undefined;

	if (bodyParameters) {
		requestBody = bodyParameters.reduce(
			bodyParamsReducer,
			{},
		) as unknown as ZodType;
	} else {
		const jsonBody = (
			(pathItem.post as OpenAPIV3.OperationObject)
				?.requestBody as OpenAPIV3.RequestBodyObject
		).content["application/json"];
		requestBody = jsonBody ? createFromSchema(jsonBody.schema) : undefined;
	}

	return requestBody;
};

const bodyParamsReducer = (
	acc: Record<string, ZodType>,
	param: ParameterObject,
) => {
	acc[param.name] = createFromParameter(param);
	return acc;
};
