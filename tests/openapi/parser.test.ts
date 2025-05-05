import { describe, expect, it } from "vitest";
import { OpenAPIParser } from "../../src/openapi/parser.js";
import { buildFixturePath } from "../utils.js";

describe("parser", () => {
    it("can correctly return the informations", async () => {
            const schemaPath = buildFixturePath("schema.json");

            const openApiParser = await OpenAPIParser.from(schemaPath)

            expect(openApiParser.getInfo()).toStrictEqual({
                name: "Swagger Petstore - OpenAPI 3.0",
                version: "1.0.26",
            });
        },
    );
});
