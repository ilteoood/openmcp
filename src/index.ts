import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { OpenAPIParser } from "./openapi/parser.js";

export const buildMcpServer = async (resourceLocator: string) => {
	const openApiParser = await OpenAPIParser.from(resourceLocator);

	const server = new McpServer(openApiParser.getInfo());

	const baseUrls = openApiParser.getHosts();

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

	for (const path of openApiParser.getPaths()) {
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

				const response = await fetch(url, {
					method: path.method,
					headers: parameters?.header,
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
