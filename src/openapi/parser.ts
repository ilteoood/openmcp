import SwaggerParser from "@apidevtools/swagger-parser";
import { type OpenAPI, OpenAPIV3 } from "openapi-types";
import type { ExtractedPath, PathItemObject } from "../types.js";
import { basePathItemExtractor, requestExtractor } from "./extractors.js";

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
				pathDefinitions.push(this.handleGet(path, pathItem));
			}
			if (pathItem.post) {
				pathDefinitions.push(this.handlePost(path, pathItem));
			}
			if (pathItem.put) {
				pathDefinitions.push(this.handlePut(path, pathItem));
			}
			if (pathItem.delete) {
				pathDefinitions.push(this.handleDelete(path, pathItem));
			}
			if (pathItem.patch) {
				pathDefinitions.push(this.handlePatch(path, pathItem));
			}
			if (pathItem.options) {
				pathDefinitions.push(this.handleOptions(path, pathItem));
			}
			if (pathItem.head) {
				pathDefinitions.push(this.handleHead(path, pathItem));
			}
			if ("trace" in pathItem) {
				pathDefinitions.push(this.handleTrace(path, pathItem));
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

	private handleGet(path: string, pathItem: PathItemObject) {
		return basePathItemExtractor(path, pathItem, OpenAPIV3.HttpMethods.GET);
	}

	private handlePost(path: string, pathItem: PathItemObject) {
		return {
			...basePathItemExtractor(path, pathItem, OpenAPIV3.HttpMethods.POST),
			request: requestExtractor(pathItem),
		};
	}

	private handlePut(path: string, pathItem: PathItemObject) {
		return {
			...basePathItemExtractor(path, pathItem, OpenAPIV3.HttpMethods.PUT),
			request: requestExtractor(pathItem),
		};
	}

	private handleDelete(path: string, pathItem: PathItemObject) {
		return basePathItemExtractor(path, pathItem, OpenAPIV3.HttpMethods.DELETE);
	}

	private handlePatch(path: string, pathItem: PathItemObject) {
		return {
			...basePathItemExtractor(path, pathItem, OpenAPIV3.HttpMethods.PATCH),
			request: requestExtractor(pathItem),
		};
	}

	private handleOptions(path: string, pathItem: PathItemObject) {
		return basePathItemExtractor(path, pathItem, OpenAPIV3.HttpMethods.OPTIONS);
	}

	private handleHead(path: string, pathItem: PathItemObject) {
		return basePathItemExtractor(path, pathItem, OpenAPIV3.HttpMethods.HEAD);
	}

	private handleTrace(path: string, pathItem: PathItemObject) {
		return basePathItemExtractor(path, pathItem, OpenAPIV3.HttpMethods.TRACE);
	}
}
