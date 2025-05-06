import { type ZodRawShape, z } from "zod";
import type { ParamRequestObject, ParameterObject } from "./types.js";

// biome-ignore lint/suspicious/noExplicitAny: this is the definition of the schema from the library
type Schema = any;

const buildBaseZodType = (schema: Schema) => {
	if (schema.type === "string") {
		if (schema.enum) {
			return z.enum(schema.enum);
		}
		return z.string();
	}
	if (schema.type === "number" || schema.type === 'integer') {
		let integerSchema = z.number();
		if (schema.minimum !== undefined) {
			integerSchema = integerSchema.min(schema.minimum);
		}
		if (schema.maximum !== undefined) {
			integerSchema = integerSchema.max(schema.maximum);
		}
		if (schema.type === 'integer') {
			integerSchema = integerSchema.int();
		}
		return integerSchema;
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
		).reduce<ParamRequestObject>((acc, [propertyName, property]) => {
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
): z.ZodType => {
	const description = parameter?.description || schema?.description || "";
	const zodType = buildBaseZodType(schema).describe(description);

	if (!parameter?.required && !schema?.required) {
		return zodType.optional();
	}

	return zodType;
};

export const createFromParameter = (parameter: ParameterObject): z.ZodType =>
	createFromSchema(parameter.schema, parameter);

export const createForObject = <T extends ZodRawShape>(object?: T) =>
	object && Object.keys(object).length ? z.object(object) : z.void();

export const createFromParameters = (parameterObjects: ParameterObject[]) => {
	const parameters = parameterObjects.reduce<ParamRequestObject>(
		(acc, parameter) => {
			const zodSchema = createFromParameter(parameter);
			acc[parameter.name] = zodSchema;
			return acc;
		},
		{},
	);

	return createForObject(parameters);
};
