import SwaggerParser from "@apidevtools/swagger-parser";
import type { OpenAPI, OpenAPIV2, OpenAPIV3 } from "openapi-types";
import type { ZodType } from "zod";
import { createZodSchema } from "./schema.js";
import type { ParameterObject, ParametersWithRef } from "./types.js";

export class OpenAPIUtil {
	private constructor(private swaggerDocument: OpenAPI.Document) {}

	static async from(resourceLocator: string): Promise<OpenAPIUtil> {
		const parsedDocument = await SwaggerParser.parse(resourceLocator);
		const dereferencedDocument =
			await SwaggerParser.dereference(parsedDocument);
		return new OpenAPIUtil(dereferencedDocument);
	}

	public getPaths(): string[] {
		const pathsDefinition = this.swaggerDocument.paths || {};
		const paths = Object.keys(pathsDefinition);
		const pathDefinition = [];

		for (const path of paths) {
			const pathItem = pathsDefinition[path];

			if (!pathItem) continue;

			if (pathItem?.get) {
				pathDefinition.push(this.handleGet(pathItem));
			}
			if (pathItem?.post) {
				pathDefinition.push(this.handlePost(pathItem));
			}
			if (pathItem?.put) {
				pathDefinition.push(this.handlePut(pathItem));
			}
			if (pathItem?.delete) {
				pathDefinition.push(this.handleDelete(pathItem));
			}
			if (pathItem?.patch) {
				pathDefinition.push(this.handlePatch(pathItem));
			}
			if (pathItem?.options) {
				pathDefinition.push(this.handleOptions(pathItem));
			}
			if (pathItem?.head) {
				pathDefinition.push(this.handleHead(pathItem));
			}
		}

		return Object.keys(paths).map((path) => {
			return path.replace(/^\//, "");
		});
	}

	private handleGet(
		pathItem: OpenAPIV2.PathItemObject | OpenAPIV3.PathItemObject,
	) {
		return {
			method: "get",
			parameters: this.extractParameters(
				pathItem.parameters,
				pathItem.get?.parameters,
			),
		};
	}

	private extractParameters(
		pathParameters?: ParametersWithRef,
		methodParameters?: ParametersWithRef,
	) {
		const parameters = (pathParameters ?? []).concat(
			methodParameters ?? [],
		) as ParameterObject[];

		return parameters.reduce(
			(acc, param) => {
				const paramSource = param.in as keyof typeof acc;
				const paramDestination = acc[paramSource];
				paramDestination.push(createZodSchema(param));
				return acc;
			},
			{
				path: [] as ZodType[],
				query: [] as ZodType[],
				header: [] as ZodType[],
				cookie: [] as ZodType[],
			},
		);
	}
}
