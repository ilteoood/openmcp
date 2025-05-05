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
				pathDefinition.push(this.handleGet(pathItem));
			}
			if (pathItem.post) {
				pathDefinition.push(this.handlePost(pathItem));
			}
			if (pathItem.put) {
				pathDefinition.push(this.handlePut(pathItem));
			}
			if (pathItem.delete) {
				pathDefinition.push(this.handleDelete(pathItem));
			}
			if (pathItem.patch) {
				pathDefinition.push(this.handlePatch(pathItem));
			}
			if (pathItem.options) {
				pathDefinition.push(this.handleOptions(pathItem));
			}
			if (pathItem.head) {
				pathDefinition.push(this.handleHead(pathItem));
			}
			if ("trace" in pathItem) {
				pathDefinition.push(this.handleTrace(pathItem));
			}
		}

		return pathDefinition;
	}

	public getInfo() {
		const info = this.swaggerDocument.info;
		return {
			name: info?.title,
			version: info?.version,
		}
	}

	private handleGet(pathItem: PathItemObject) {
		return basePathItemExtractor(pathItem, HTTPMethods.GET);
	}

	private handlePost(pathItem: PathItemObject) {
		return {
			...basePathItemExtractor(pathItem, HTTPMethods.POST),
			request: requestExtractor(pathItem),
		};
	}

	private handlePut(pathItem: PathItemObject) {
		return {
			...basePathItemExtractor(pathItem, HTTPMethods.PUT),
			request: requestExtractor(pathItem),
		};
	}

	private handleDelete(pathItem: PathItemObject) {
		return basePathItemExtractor(pathItem, HTTPMethods.DELETE);
	}

	private handlePatch(pathItem: PathItemObject) {
		return {
			...basePathItemExtractor(pathItem, HTTPMethods.PATCH),
			request: requestExtractor(pathItem),
		};
	}

	private handleOptions(pathItem: PathItemObject) {
		return basePathItemExtractor(pathItem, HTTPMethods.OPTIONS);
	}

	private handleHead(pathItem: PathItemObject) {
		return basePathItemExtractor(pathItem, HTTPMethods.HEAD);
	}

	private handleTrace(pathItem: PathItemObject) {
		return basePathItemExtractor(pathItem, HTTPMethods.TRACE);
	}
}
