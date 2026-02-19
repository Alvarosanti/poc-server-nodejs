import { createServer } from "@modelcontextprotocol/sdk/server/http.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const mcpServer = new McpServer(
  {
    name: "mcp-demo-minimal",
    version: "1.0.0",
  },
  {
    capabilities: { tools: {} }
  }
);

mcpServer.registerTool(
  "greet",
  {
    title: "Saludar",
    description: "Saluda a una persona por su nombre",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string" }
      },
      required: ["name"]
    }
  },
  async ({ name }) => ({
    content: [
      {
        type: "text",
        text: `¡Hola, ${name}! 🚀`
      }
    ]
  })
);

const server = createServer(mcpServer);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 MCP corriendo en puerto ${PORT}`);
});
