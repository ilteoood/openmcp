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

export type ExtractedPath = {
	name: string;
	path: string;
	method: OpenAPIV3.HttpMethods;
	parameters: {
		path: Record<string, ZodType>;
		query: Record<string, ZodType>;
		header: Record<string, ZodType>;
		cookie: Record<string, ZodType>;
	};
	request?: {
		body: Record<string, ZodType>;
		formData: Record<string, ZodType>;
	};
};
