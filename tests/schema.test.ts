import { describe, expect, it } from "vitest";
import { createZodSchema } from "../src/schema.js";
import { loadFixtures } from "./utils.js";

describe("schema", () => {
	const fieldsToGenerate = [
		{ type: "integer", index: 0 },
		{ type: "string", index: 1 },
		{ type: "boolean", index: 2 },
		{ type: "number", index: 3 },
		{ type: "array", index: 4 },
		{ type: "object", index: 5 },
	];

	it.each(fieldsToGenerate)(
		"should create a zod schema for a $type type",
		async ({ type, index }) => {
			const petSchema = await loadFixtures("schema.json");

			const petIdParameter =
				petSchema.paths["/pet/{petId}"].post.parameters[index];

			const zodSchema = createZodSchema(petIdParameter);

			expect(zodSchema).toMatchSnapshot();
		},
	);
});
