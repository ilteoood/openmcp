import SwaggerParser from "@apidevtools/swagger-parser";
import { type OpenAPI, OpenAPIV3 } from "openapi-types";
import type { ExtractedPath } from "../types.js";
import { basePathItemExtractor, pathItemWithBodyExtractor } from "./extractors.js";

export class OpenAPIParser {
	private constructor(private swaggerDocument: OpenAPI.Document) {}

	static async from(resourceLocator: string): Promise<OpenAPIParser> {
		const parsedDocument = await SwaggerParser.parse(resourceLocator);
		const dereferencedDocument =
			await SwaggerParser.dereference(parsedDocument);
		return new OpenAPIParser(dereferencedDocument);
	}

	public getPaths(): ExtractedPath[] {
		const pathsDefinition = this.swaggerDocument.paths || {};
		const paths = Object.keys(pathsDefinition);
		const pathDefinitions: ExtractedPath[] = [];

		for (const path of paths) {
			const pathItem = pathsDefinition[path];

			if (!pathItem) continue;

			if (pathItem.get) {
				pathDefinitions.push(basePathItemExtractor(path, pathItem, OpenAPIV3.HttpMethods.GET));
			}
			if (pathItem.post) {
				pathDefinitions.push(pathItemWithBodyExtractor(path, pathItem, OpenAPIV3.HttpMethods.POST));
			}
			if (pathItem.put) {
				pathDefinitions.push(pathItemWithBodyExtractor(path, pathItem, OpenAPIV3.HttpMethods.PUT));
			}
			if (pathItem.delete) {
				pathDefinitions.push(basePathItemExtractor(path, pathItem, OpenAPIV3.HttpMethods.DELETE));
			}
			if (pathItem.patch) {
				pathDefinitions.push(pathItemWithBodyExtractor(path, pathItem, OpenAPIV3.HttpMethods.PATCH));
			}
			if (pathItem.options) {
				pathDefinitions.push(basePathItemExtractor(path, pathItem, OpenAPIV3.HttpMethods.OPTIONS));
			}
			if (pathItem.head) {
				pathDefinitions.push(basePathItemExtractor(path, pathItem, OpenAPIV3.HttpMethods.HEAD));
			}
			if ("trace" in pathItem) {
				pathDefinitions.push(basePathItemExtractor(path, pathItem, OpenAPIV3.HttpMethods.TRACE));
			}
		}

		return pathDefinitions;
	}

	public getInfo() {
		const info = this.swaggerDocument.info;
		return {
			name: info.title,
			version: info.version,
		};
	}
}
