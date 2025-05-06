import { join } from "node:path";
import SwaggerParser from "@apidevtools/swagger-parser";

export const buildFixturePath = (fileName: string) => {
	const filePath = new URL(join("fixtures", fileName), import.meta.url);
	return filePath.toString();
};

export const loadFixtures = async (fileName: string) => {
	const filePath = buildFixturePath(fileName);

	return SwaggerParser.parse(filePath);
};
