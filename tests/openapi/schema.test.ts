import { describe, expect, it } from "vitest";
import {
	createFromParameter,
	createFromParameters
} from "../../src/schema.js";
import { loadFixtures } from "../utils.js";

describe("schema", () => {
	describe("createFromParameter", () => {
		const fieldsToGenerate = [
			"integer",
			"string",
			"boolean",
			"number",
			"array",
			"object",
			"integer not required",
			"string with enum",
			"number with min and max",
			"integer with min and max",
			"string with minLength and maxLength",
			"number with default",
			"unknown type",
		].map((type, index) => ({ type, index }));

		it.each(fieldsToGenerate)(
			"should create a zod schema for a $type type",
			async ({ index }) => {
				const petSchema = await loadFixtures("schema.json");

				const petIdParameter =
					petSchema.paths["/pet/{petId}"].post.parameters[index];

				const zodSchema = createFromParameter(petIdParameter);

				expect(zodSchema).toMatchSnapshot();
			},
		);
	});

	it("should create a zod schema from an array of parameters", async () => {
		const petSchema = await loadFixtures("schema.json");

		const petIdParameters = petSchema.paths["/pet/{petId}"].post.parameters;

		const zodSchema = createFromParameters(petIdParameters);
		expect(zodSchema).toMatchSnapshot();
	});
});
