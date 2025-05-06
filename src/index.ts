import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { OpenAPIParser } from "./openapi/parser.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

export const buildMcpServer = async (resourceLocator: string) => {
	const openApiParser = await OpenAPIParser.from(resourceLocator);

	const server = new McpServer(openApiParser.getInfo());

	for (const path of openApiParser.getPaths()) {
		server.tool(
			path.name,
			{ parameters: path.parameters, request: path.request },
			(received) => {
				console.log('received', received);
				return {
					content: [],
				};
			},
		);
	}

	return server;
};

const mcpServer = await buildMcpServer("https://petstore3.swagger.io/api/v3/openapi.json");

const transport = new StdioServerTransport()

await mcpServer.connect(transport);