import { describe, expect, it } from "vitest";
import { OpenAPIParser } from "../../src/openapi/parser.js";
import { buildFixturePath } from "../utils.js";

describe("parser", () => {
	describe("getInfo", () => {
		it("can correctly parse a swagger 2.0 schema", async () => {
			const schemaPath = buildFixturePath("petstore2.json");

			const openApiParser = await OpenAPIParser.from(schemaPath);

			expect(openApiParser.getInfo()).toStrictEqual({
				name: "Swagger Petstore",
				version: "1.0.7",
			});
		});

		it("can correctly parse an openapi 3.0 schema", async () => {
			const schemaPath = buildFixturePath("petstore3.json");

			const openApiParser = await OpenAPIParser.from(schemaPath);

			expect(openApiParser.getInfo()).toStrictEqual({
				name: "Swagger Petstore - OpenAPI 3.0",
				version: "1.0.26",
			});
		});
	});

	describe("getPaths", () => {
		it("can correctly parse a swagger 2.0 schema", async () => {
			const schemaPath = buildFixturePath("petstore2.json");

			const openApiParser = await OpenAPIParser.from(schemaPath);

			expect(openApiParser.getPaths()).toMatchSnapshot();
		});

		it("can correctly parse an openapi 3.0 schema", async () => {
			const schemaPath = buildFixturePath("petstore3.json");

			const openApiParser = await OpenAPIParser.from(schemaPath);

			expect(openApiParser.getPaths()).toMatchSnapshot();
		});

		it("can correctly parse a custom schema", async () => {
			const schemaPath = buildFixturePath("schema.json");

			const openApiParser = await OpenAPIParser.from(schemaPath);

			expect(openApiParser.getPaths()).toMatchSnapshot();
		});
	});

	describe("getBaseUrls", () => {
		it("can correctly parse a swagger 2.0 schema", async () => {
			const schemaPath = buildFixturePath("petstore2.json");

			const openApiParser = await OpenAPIParser.from(schemaPath);

			expect(openApiParser.getBaseUrls()).toStrictEqual([
				"https://petstore.swagger.io/v2",
				"http://petstore.swagger.io/v2",
			]);
		});

		it("can correctly parse an openapi 3.0 schema", async () => {
			const schemaPath = buildFixturePath("petstore3.json");

			const openApiParser = await OpenAPIParser.from(schemaPath);

			expect(openApiParser.getBaseUrls()).toStrictEqual(["file:///api/v3"]);
		});

		it("can correctly parse a custom schema", async () => {
			const schemaPath = buildFixturePath("schema.json");

			const openApiParser = await OpenAPIParser.from(schemaPath);

			expect(openApiParser.getBaseUrls()).toStrictEqual([
				"https://petstore3.swagger.io/api/v3",
			]);
		});
	});

	describe("getSecurityDefinitions", () => {
		it("can correctly parse a swagger 2.0 schema", async () => {
			const schemaPath = buildFixturePath("petstore2.json");

			const openApiParser = await OpenAPIParser.from(schemaPath);

			expect(openApiParser.getSecurityDefinitions()).toStrictEqual({
				api_key: {
					type: "apiKey",
					name: "api_key",
					in: "header",
				},
				petstore_auth: {
					authorizationUrl: "https://petstore.swagger.io/oauth/authorize",
					type: "oauth2",
					flow: "implicit",
					scopes: {
						"write:pets": "modify pets in your account",
						"read:pets": "read your pets",
					},
				},
			});
		});

		it("can correctly parse an openapi 3.0 schema", async () => {
			const schemaPath = buildFixturePath("petstore3.json");

			const openApiParser = await OpenAPIParser.from(schemaPath);

			expect(openApiParser.getSecurityDefinitions()).toStrictEqual({
				petstore_auth: {
					flows: {
						implicit: {
							authorizationUrl: "https://petstore3.swagger.io/oauth/authorize",
							scopes: {
								"write:pets": "modify pets in your account",
								"read:pets": "read your pets",
							},
						},
					},
					type: "oauth2",
				},
				api_key: {
					type: "apiKey",
					name: "api_key",
					in: "header",
				},
			});
		});
	});
});
