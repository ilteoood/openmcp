import { OpenAPIV2, OpenAPIV3, type OpenAPIV3_1 } from "openapi-types";

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

export const HTTPMethods = {
	...OpenAPIV2.HttpMethods,
	...OpenAPIV3.HttpMethods,
};
