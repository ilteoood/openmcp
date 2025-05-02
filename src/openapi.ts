import SwaggerParser from "@apidevtools/swagger-parser";
import type { OpenAPI, OpenAPIV2, OpenAPIV3 } from "openapi-types";
import { ZodType } from "zod";
import { createZodSchema } from "./schema";
import type { ParameterObject } from "./types";

export class OpenAPIUtil {
	private constructor(private swaggerDocument: OpenAPI.Document<{}>) {}

	static async from(resourceLocator: string): Promise<OpenAPIUtil> {
		const swaggerParser = await SwaggerParser.parse(resourceLocator);
		return new OpenAPIUtil(swaggerParser);
	}

	public getPaths(): string[] {
		const pathsDefinition = this.swaggerDocument.paths || {};
		const paths = Object.keys(pathsDefinition);

		for (const path of paths) {
			const pathItem = pathsDefinition[path];

			if (!pathItem) continue;

			if (pathItem?.get) {
				this.handleGet(pathItem);
			}
		}

		return Object.keys(paths).map((path) => {
			return path.replace(/^\//, "");
		});
	}

	private handleGet(
		pathItem: OpenAPIV2.PathItemObject | OpenAPIV3.PathItemObject,
	) {
		const parameters = pathItem.parameters as ParameterObject[];

		const dividedParameters = parameters.reduce(
			(acc, param) => {
				const paramIn = param.in;
				let paramDestination = acc.pathParams;
				if (paramIn === "query") {
					paramDestination = acc.queryParams;
				} else if (paramIn === "header") {
					paramDestination = acc.headerParams;
				} else if (paramIn === "cookie") {
					paramDestination = acc.cookieParams;
				}
                paramDestination.push(createZodSchema(param));
				return acc;
			},
			{
				pathParams: [] as ZodType[],
                queryParams: [] as ZodType[],
                headerParams: [] as ZodType[],
                cookieParams: [] as ZodType[],
			},
		);

		return {
			method: "get",
			...dividedParameters,
		};
	}
}
