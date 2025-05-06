import { describe, expect, it } from "vitest";
import { basePathItemExtractor } from "../../src/openapi/extractors.js";
import { OpenAPIParser } from "../../src/openapi/parser.js";
import { HTTPMethods } from "../../src/types.js";
import { buildFixturePath, loadFixtures } from "../utils.js";

describe("parser", () => {
	it("can correctly return the informations", async () => {
		const schemaPath = buildFixturePath("schema.json");

		const openApiParser = await OpenAPIParser.from(schemaPath);

		expect(openApiParser.getInfo()).toStrictEqual({
			name: "Swagger Petstore - OpenAPI 3.0",
			version: "1.0.26",
		});
	});

	it("can correctly return base path item", async () => {
		const openApiDocument = await loadFixtures("schema.json");

		const result = await basePathItemExtractor(
			"/pet/{petId}",
			openApiDocument.paths["/pet/{petId}"],
			HTTPMethods.POST,
		);

		expect(result).toMatchSnapshot();
	});

	it("can correctly return base path item - generated name", async () => {
		const openApiDocument = await loadFixtures("schema.json");

		const result = await basePathItemExtractor(
			"/pets/location",
			openApiDocument.paths["/pets/location"],
			HTTPMethods.POST,
		);

		expect(result).toMatchSnapshot();
	});
});
