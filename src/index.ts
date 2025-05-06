import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { OpenAPIParser } from "./openapi/parser.js";

export const buildMcpServer = async (resourceLocator: string) => {
    const openApiParser = await OpenAPIParser.from(resourceLocator);

    const server = new McpServer(openApiParser.getInfo())
}