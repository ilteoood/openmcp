import type { OpenAPIV2, OpenAPIV3, OpenAPIV3_1 } from "openapi-types";
import type { ZodType } from "zod";

export type PathItemObject =
	| OpenAPIV2.PathItemObject
	| OpenAPIV3.PathItemObject
	| OpenAPIV3_1.PathItemObject;

export type ParameterObject =
	| OpenAPIV2.ParameterObject
	| OpenAPIV3.ParameterObject
	| OpenAPIV3_1.ParameterObject;

export type ParametersWithRef = (
	| OpenAPIV2.PathItemObject
	| OpenAPIV3.PathItemObject
	| OpenAPIV3_1.PathItemObject
)["parameters"];

export type ParamRequestObject = Record<string, ZodType>;
export type RequestBodySchema = ZodType | ParamRequestObject;
export type FormDataSchema = ZodType | ParamRequestObject;

export type ExtractedPath = {
	name: string;
	path: string;
	method: OpenAPIV3.HttpMethods;
	parameters: {
		path: ParamRequestObject;
		query: ParamRequestObject;
		header: ParamRequestObject;
		cookie: ParamRequestObject;
	};
	request?: {
		body: RequestBodySchema;
		formData: FormDataSchema;
	};
};
