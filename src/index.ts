import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { httpCookie } from "cookie-muncher";
import type { OpenAPIV2, OpenAPIV3 } from "openapi-types";
import { z } from "zod";
import { OpenAPIParser } from "./openapi/parser.js";

const SUPPORTED_SECURITY_TYPES = new Set(["apiKey", "http", "basic"]);

const enrichWithAuth = (
	securityKeys: string[],
	securityDefinitions:
		| OpenAPIV2.SecurityDefinitionsObject
		| Record<string, OpenAPIV3.SecuritySchemeObject>,
	header: Record<string, unknown>,
	cookie: Record<string, unknown>,
	url: URL,
) => {
	for (const securityKey of securityKeys) {
		const securityDefinition = securityDefinitions[securityKey];
		if (securityDefinition.type === "apiKey") {
			const apiKeyIn = securityDefinition.in;
			if (apiKeyIn === "header") {
				header[securityDefinition.name] = "TODO";
			} else if (apiKeyIn === "query") {
				url.searchParams.append(securityDefinition.name, "TODO");
			} else if (apiKeyIn === "cookie") {
				cookie[securityDefinition.name] = "TODO";
			}
		} else if (
			(securityDefinition.type === "http" &&
				securityDefinition.scheme === "basic") ||
			securityDefinition.type === "basic"
		) {
			const authHeader = `Basic ${btoa("TODO:TODO")}`;
			header.Authorization = authHeader;
		} else if (
			securityDefinition.type === "http" &&
			securityDefinition.scheme === "bearer"
		) {
			const authHeader = "Bearer TODO";
			header.Authorization = authHeader;
		}
	}
};

export const buildMcpServer = async (resourceLocator: string) => {
	const openApiParser = await OpenAPIParser.from(resourceLocator);

	const server = new McpServer(openApiParser.getInfo());

	const baseUrls = openApiParser.getBaseUrls();

	let [baseUrl] = baseUrls;

	if (baseUrls.length > 1) {
		server.prompt("multipleHostsFound", {}, () => ({
			messages: [
				{
					role: "assistant",
					content: {
						type: "text",
						text: `Please select a base URL for the API. Available options are: ${baseUrls.join(", ")}`,
					},
				},
			],
		}));
		server.tool(
			"multipleHostsFound",
			{ baseUrl: z.string().describe("API Base URL") },
			({ baseUrl: newBaseUrl }) => {
				baseUrl = newBaseUrl;
				return {
					content: [],
				};
			},
		);
	}

	const securityDefinitions = openApiParser.getSecurityDefinitions();

	for (const path of openApiParser.getPaths()) {
		const securityKeys = path.security?.find((security) =>
			security.every((security) =>
				SUPPORTED_SECURITY_TYPES.has(securityDefinitions[security]?.type),
			),
		);

		server.tool(
			path.name,
			{ parameters: path.parameters, request: path.request },
			async ({ parameters, request }) => {
				const pathParameters = parameters?.path || {};

				const replacedPath = Object.entries(pathParameters).reduce(
					(acc, [key, value]) => acc.replace(`{${key}}`, `${value}`),
					path.path,
				);

				const requestBody = request?.body;

				const url = new URL(`${baseUrl}${replacedPath}`);

				let formData: FormData | undefined;

				if (request?.formData) {
					formData = new FormData();
					for (const [key, value] of Object.entries(request.formData)) {
						formData.append(key, `${value}`);
					}
				}
				if (parameters?.query) {
					for (const [key, value] of Object.entries(parameters.query)) {
						url.searchParams.append(key, `${value}`);
					}
				}

				const header = parameters?.header || {};
				const cookie = parameters?.cookie || {};

				if (securityKeys?.length) {
					enrichWithAuth(
						securityKeys,
						securityDefinitions,
						header,
						cookie,
						url,
					);
				}

				const response = await fetch(url, {
					method: path.method,
					headers: {
						...header,
						Cookie: httpCookie.serialize(cookie),
					},
					body: formData ?? (requestBody && JSON.stringify(requestBody)),
				});

				if (!response.ok) {
					throw new Error(`Request failed with status ${response.status}`);
				}

				return {
					content: [
						{
							type: "text",
							text: JSON.stringify(await response.json()),
						},
					],
				};
			},
		);
	}

	return server;
};

const mcpServer = await buildMcpServer(
	"https://petstore3.swagger.io/api/v3/openapi.json",
);

const transport = new StdioServerTransport();

await mcpServer.connect(transport);
