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
});
