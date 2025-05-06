import { describe, expect, it } from "vitest";
import { createFromParameter } from "../../src/schema.js";
import { loadFixtures } from "../utils.js";

describe("schema", () => {
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
	].map((type, index) => ({ type, index }));

	it.each(fieldsToGenerate)(
		"should create a zod schema for a $type type",
		async ({ type, index }) => {
			const petSchema = await loadFixtures("schema.json");

			const petIdParameter =
				petSchema.paths["/pet/{petId}"].post.parameters[index];

			const zodSchema = createFromParameter(petIdParameter);

			expect(zodSchema).toMatchSnapshot();
		},
	);
});
