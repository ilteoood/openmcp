import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { OpenAPIParser } from "./openapi/parser.js";

export const buildMcpServer = async (resourceLocator: string) => {
	const openApiParser = await OpenAPIParser.from(resourceLocator);

	const server = new McpServer(openApiParser.getInfo());

	for (const path of openApiParser.getPaths()) {
		server.tool(
			path.name,
			{ parameters: path.parameters, request: path.request },
			async ({parameters, request}) => {
				const pathParameters = parameters?.path || {};

				const replacedPath = Object.entries(pathParameters).reduce(
					(acc, [key, value]) => acc.replace(`{${key}}`, `${value}`),
					path.path,
				);

				const requestBody = request?.body;

				const url = new URL(`https://petstore.swagger.io/v2/${replacedPath}`);

				let formData: FormData | undefined;

				if (request?.formData) {
					formData = new FormData()
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
				})

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
	"https://petstore.swagger.io/v2/swagger.json",
);

const transport = new StdioServerTransport();

await mcpServer.connect(transport);
