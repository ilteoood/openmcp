import { z } from "zod";
import type { ParameterObject } from "./types.js";

// biome-ignore lint/suspicious/noExplicitAny: this is the definition of the schema from the library
type Schema = any;

const buildBaseZodType = (schema: Schema) => {
	if (schema.type === "string") {
		return z.string();
	}
	if (schema.type === "number") {
		return z.number();
	}
	if (schema.type === "integer") {
		return z.number().int();
	}
	if (schema.type === "boolean") {
		return z.boolean();
	}
	if (schema.type === "array") {
		return z.array(createFromSchema(schema.items));
	}
	if (schema.type === "object") {
		const zodObjectShape = Object.entries<Schema>(
			schema.properties || {},
		).reduce<Record<string, z.ZodType>>((acc, [propertyName, property]) => {
			let zodSchema = createFromSchema(property);
			if (!property.required && !schema.required?.includes(propertyName)) {
				zodSchema = zodSchema.optional();
			}

			acc[propertyName] = zodSchema;
			return acc;
		}, {});
		return z.object(zodObjectShape);
	}
	return z.any();
};

export const createFromSchema = (
	schema: Schema,
	parameter?: ParameterObject,
): z.ZodType<unknown> => {
	const description = parameter?.description || schema?.description || "";
	const zodType = buildBaseZodType(schema).describe(description);

	if (!parameter?.required && !schema?.required) {
		return zodType.optional();
	}

	return zodType;
};

export const createFromParameter = (
	parameter: ParameterObject,
): z.ZodType<unknown> => createFromSchema(parameter.schema, parameter);
