import SwaggerParser from "@apidevtools/swagger-parser";
import type { OpenAPI } from "openapi-types";
import {
	HTTPMethods,
	type PathItemObject
} from "../types.js";
import { basePathItemExtractor, requestExtractor } from "./extractors.js";

export class OpenAPIParser {
	private constructor(private swaggerDocument: OpenAPI.Document) {}

	static async from(resourceLocator: string): Promise<OpenAPIParser> {
		const parsedDocument = await SwaggerParser.parse(resourceLocator);
		const dereferencedDocument =
			await SwaggerParser.dereference(parsedDocument);
		return new OpenAPIParser(dereferencedDocument);
	}

	public getPaths() {
		const pathsDefinition = this.swaggerDocument.paths || {};
		const paths = Object.keys(pathsDefinition);
		const pathDefinition = [];

		for (const path of paths) {
			const pathItem = pathsDefinition[path];

			if (!pathItem) continue;

			if (pathItem.get) {
				pathDefinition.push(this.handleGet(path, pathItem));
			}
			if (pathItem.post) {
				pathDefinition.push(this.handlePost(path, pathItem));
			}
			if (pathItem.put) {
				pathDefinition.push(this.handlePut(path, pathItem));
			}
			if (pathItem.delete) {
				pathDefinition.push(this.handleDelete(path, pathItem));
			}
			if (pathItem.patch) {
				pathDefinition.push(this.handlePatch(path, pathItem));
			}
			if (pathItem.options) {
				pathDefinition.push(this.handleOptions(path, pathItem));
			}
			if (pathItem.head) {
				pathDefinition.push(this.handleHead(path, pathItem));
			}
			if ("trace" in pathItem) {
				pathDefinition.push(this.handleTrace(path, pathItem));
			}
		}

		return pathDefinition;
	}

	public getInfo() {
		const info = this.swaggerDocument.info;
		return {
			name: info.title,
			version: info.version,
		}
	}

	private handleGet(path: string, pathItem: PathItemObject) {
		return basePathItemExtractor(path, pathItem, HTTPMethods.GET);
	}

	private handlePost(path: string, pathItem: PathItemObject) {
		return {
			...basePathItemExtractor(path, pathItem, HTTPMethods.POST),
			request: requestExtractor(pathItem),
		};
	}

	private handlePut(path: string, pathItem: PathItemObject) {
		return {
			...basePathItemExtractor(path, pathItem, HTTPMethods.PUT),
			request: requestExtractor(pathItem),
		};
	}

	private handleDelete(path: string, pathItem: PathItemObject) {
		return basePathItemExtractor(path, pathItem, HTTPMethods.DELETE);
	}

	private handlePatch(path: string, pathItem: PathItemObject) {
		return {
			...basePathItemExtractor(path, pathItem, HTTPMethods.PATCH),
			request: requestExtractor(pathItem),
		};
	}

	private handleOptions(path: string, pathItem: PathItemObject) {
		return basePathItemExtractor(path, pathItem, HTTPMethods.OPTIONS);
	}

	private handleHead(path: string, pathItem: PathItemObject) {
		return basePathItemExtractor(path, pathItem, HTTPMethods.HEAD);
	}

	private handleTrace(path: string, pathItem: PathItemObject) {
		return basePathItemExtractor(path, pathItem, HTTPMethods.TRACE);
	}
}
