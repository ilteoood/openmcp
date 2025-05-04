import { z } from "zod";
import type { ParameterObject } from "./types.js";

const buildBaseZodType = (schema: Record<string, unknown>) => {
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
		return z.array(z.any());
	}
	if (schema.type === "object") {
		const zodObjectShape = Object.entries(schema.properties || {}).reduce<
			Record<string, z.ZodType>
		>((acc, [propertyName, property]) => {
			acc[propertyName] = createFromSchema(property);
			return acc;
		}, {});
		return z.object(zodObjectShape);
	}
	return z.any();
};

const createFromSchema = (
	schema: Record<string, string>,
	parameter?: ParameterObject,
): z.ZodType<unknown> => {
	const description = parameter?.description || schema?.description || "";
	const zodType = buildBaseZodType(schema).describe(description);

	if (!parameter?.required || !schema?.required) {
		return zodType.optional();
	}

	return zodType;
};

export const createZodSchema = (
	parameter: ParameterObject,
): z.ZodType<unknown> => createFromSchema(parameter.schema, parameter);
