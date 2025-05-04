import type { OpenAPIV2, OpenAPIV3, OpenAPIV3_1 } from "openapi-types";

export type ParameterObject =
	| OpenAPIV2.ParameterObject
	| OpenAPIV3.ParameterObject
	| OpenAPIV3_1.ParameterObject;

export type ParametersWithRef = (OpenAPIV2.PathItemObject | OpenAPIV3.PathItemObject | OpenAPIV3_1.PathItemObject)['parameters'];