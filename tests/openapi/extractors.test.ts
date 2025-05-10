import { OpenAPIV3 } from "openapi-types";
import { describe, expect, it } from "vitest";
import { basePathItemExtractor } from "../../src/openapi/extractors.js";
import { loadFixtures } from "../utils.js";

describe("extractors", () => {
	describe("basePathItemExtractor", () => {
		it("can correctly return base path item", async () => {
			const openApiDocument = await loadFixtures("schema.json");

			const result = basePathItemExtractor(
				"/pet/{petId}",
				openApiDocument.paths["/pet/{petId}"],
				OpenAPIV3.HttpMethods.POST,
			);

			expect(result).toMatchSnapshot();
		});

		it("can correctly return base path item - generated name", async () => {
			const openApiDocument = await loadFixtures("schema.json");

			const result = basePathItemExtractor(
				"/pets/location",
				openApiDocument.paths["/pets/location"],
				OpenAPIV3.HttpMethods.POST,
			);

			expect(result).toMatchSnapshot();
		});
	});
});
