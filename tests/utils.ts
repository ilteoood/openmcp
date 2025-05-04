import { join } from "node:path";
import SwaggerParser from "@apidevtools/swagger-parser";

export const loadFixtures = async (fileName: string) => {
	const filePath = new URL(join("fixtures", fileName), import.meta.url);

	return SwaggerParser.parse(filePath.toString());
};
