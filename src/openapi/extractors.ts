import type { OpenAPIV3 } from "openapi-types";
import {
	createForObject,
	createFromParameter,
	createFromParameters,
	createFromSchema,
} from "../schema.js";
import type {
	ExtractedPath,
	FormDataSchema,
	ParamRequestObject,
	ParameterObject,
	ParametersWithRef,
	PathItemObject,
	RequestBodySchema,
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

	const reducedParameters = parameters.reduce<
		Record<string, ParamRequestObject>
	>((acc, param) => {
		const paramSource = param.in as keyof typeof acc;
		acc[paramSource] ??= {};
		const paramDestination = acc[paramSource];
		paramDestination[param.name] = createFromParameter(param);
		return acc;
	}, {});

	return createForObject({
		path: createForObject(reducedParameters.path),
		query: createForObject(reducedParameters.query),
		header: createForObject(reducedParameters.header),
		cookie: createForObject(reducedParameters.cookie),
	});
};

export const requestExtractor = (pathItem: PathItemObject) => {
	return {
		body: extractRequestBody(pathItem),
		formData: extractFormData(pathItem),
	};
};

const extractFormData = (pathItem: PathItemObject): FormDataSchema => {
	const formDataParameters = (
		pathItem.post?.parameters as ParameterObject[] | undefined
	)?.filter((param) => param.in === "formData");

	let requestFormData: FormDataSchema;

	if (formDataParameters) {
		requestFormData = createFromParameters(formDataParameters);
	} else {
		const formDataBody = (
			(pathItem.post as OpenAPIV3.OperationObject)
				?.requestBody as OpenAPIV3.RequestBodyObject
		)?.content?.["application/x-www-form-urlencoded"];
		requestFormData = formDataBody ? createFromSchema(formDataBody.schema) : {};
	}

	return requestFormData;
};

const extractRequestBody = (pathItem: PathItemObject): RequestBodySchema => {
	const bodyParameters = (
		pathItem.post?.parameters as ParameterObject[] | undefined
	)?.filter((param) => param.in === "body");

	let requestBody: RequestBodySchema;

	if (bodyParameters) {
		requestBody = createFromParameters(bodyParameters);
	} else {
		const jsonBody = (
			(pathItem.post as OpenAPIV3.OperationObject)
				?.requestBody as OpenAPIV3.RequestBodyObject
		)?.content?.["application/json"];
		requestBody = jsonBody ? createFromSchema(jsonBody.schema) : {};
	}

	return requestBody;
};
