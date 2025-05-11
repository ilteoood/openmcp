import SwaggerParser from "@apidevtools/swagger-parser";
import { type OpenAPI, type OpenAPIV2, OpenAPIV3 } from "openapi-types";
import type { ExtractedPath } from "../types.js";
import {
	basePathItemExtractor,
	pathItemWithBodyExtractor,
} from "./extractors.js";

export class OpenAPIParser {
	private constructor(
		private swaggerDocument: OpenAPI.Document,
		private resourceLocator: URL,
	) {}

	static async from(resourceLocator: string): Promise<OpenAPIParser> {
		const parsedDocument = await SwaggerParser.parse(resourceLocator);
		const dereferencedDocument =
			await SwaggerParser.dereference(parsedDocument);
		return new OpenAPIParser(dereferencedDocument, new URL(resourceLocator));
	}

	public getPaths(): ExtractedPath[] {
		const pathsDefinition = this.swaggerDocument.paths || {};
		const paths = Object.keys(pathsDefinition);
		const pathDefinitions: ExtractedPath[] = [];

		for (const path of paths) {
			const pathItem = pathsDefinition[path];

			if (!pathItem) continue;

			if (pathItem.get) {
				pathDefinitions.push(
					basePathItemExtractor(path, pathItem, OpenAPIV3.HttpMethods.GET),
				);
			}
			if (pathItem.post) {
				pathDefinitions.push(
					pathItemWithBodyExtractor(path, pathItem, OpenAPIV3.HttpMethods.POST),
				);
			}
			if (pathItem.put) {
				pathDefinitions.push(
					pathItemWithBodyExtractor(path, pathItem, OpenAPIV3.HttpMethods.PUT),
				);
			}
			if (pathItem.delete) {
				pathDefinitions.push(
					basePathItemExtractor(path, pathItem, OpenAPIV3.HttpMethods.DELETE),
				);
			}
			if (pathItem.patch) {
				pathDefinitions.push(
					pathItemWithBodyExtractor(
						path,
						pathItem,
						OpenAPIV3.HttpMethods.PATCH,
					),
				);
			}
			if (pathItem.options) {
				pathDefinitions.push(
					basePathItemExtractor(path, pathItem, OpenAPIV3.HttpMethods.OPTIONS),
				);
			}
			if (pathItem.head) {
				pathDefinitions.push(
					basePathItemExtractor(path, pathItem, OpenAPIV3.HttpMethods.HEAD),
				);
			}
			if ("trace" in pathItem) {
				pathDefinitions.push(
					basePathItemExtractor(path, pathItem, OpenAPIV3.HttpMethods.TRACE),
				);
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

	public getBaseUrls() {
		const swaggerDocument = this.swaggerDocument as OpenAPIV2.Document;
		if (swaggerDocument.swagger) {
			const schemes = swaggerDocument.schemes?.length
				? swaggerDocument.schemes
				: [this.resourceLocator.protocol.slice(0, -1)];

			return schemes.map(
				(scheme) =>
					`${scheme}://${swaggerDocument.host ?? this.resourceLocator.host}${swaggerDocument.basePath ?? ""}`,
			);
		}

		const openApiDocumentV3 = this.swaggerDocument as OpenAPIV3.Document;

		const servers = openApiDocumentV3.servers || [{ url: "" }];

		return servers.map((server) => {
			if (server.url.startsWith("http")) {
				return server.url;
			}

			return `${this.resourceLocator.protocol}//${this.resourceLocator.host}${server.url}`;
		});
	}

	public getSecurityDefinitions() {
		const swaggerDocument = this.swaggerDocument as OpenAPIV2.Document;
		if (swaggerDocument.swagger) {
			return swaggerDocument.securityDefinitions ?? {};
		}

		const openApiDocumentV3 = this.swaggerDocument as OpenAPIV3.Document;

		return openApiDocumentV3.components?.securitySchemes ?? {};
	}
}
