import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createExpressServer } 
  from "@modelcontextprotocol/sdk/server/express.js";

const mcpServer = new McpServer({
  name: "mcp-demo-minimal",
  version: "1.0.0",
});

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
        text: `¡Hola, ${name}! Bienvenido al MCP demo 🚀`
      }
    ]
  })
);

const app = express();

// 👇 Esto crea correctamente el endpoint /mcp
createExpressServer(app, mcpServer);

app.get("/", (_, res) => {
  res.json({ status: "MCP server running" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 MCP corriendo en puerto ${PORT}`);
});
