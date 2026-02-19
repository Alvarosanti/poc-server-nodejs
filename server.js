import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport }
  from "@modelcontextprotocol/sdk/server/streamableHttp.js";

const app = express();

app.all("/mcp", async (req, res) => {
  try {
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
        description: "Usa esta herramienta únicamente cuando el usuario quiera saludar o enviar un saludo a alguien.",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string" }
          },
          required: ["name"]
        }
      },
      async ({ name }) => {
        if (!name) {
          return {
            content: [
              { type: "text", text: "Nombre no proporcionado." }
            ]
          };
        }

        return {
          content: [
            { type: "text", text: `¡Hola, ${name}! 🚀` }
          ]
        };
      }
    );

    mcpServer.registerTool(
      "sumar",
      {
        title: "Sumar números",
        description: "Herramienta obligatoria para realizar operaciones matemáticas de suma entre dos números.",
        inputSchema: {
          type: "object",
          properties: {
            a: { type: "number" },
            b: { type: "number" }
          },
          required: ["a", "b"]
        }
      },
      async ({ a, b }) => ({
        content: [
          { type: "text", text: `Resultado: ${a + b}` }
        ]
      })
    );

    const transport = new StreamableHTTPServerTransport({
      keepAlive: true
    });

    await mcpServer.connect(transport);

    // 🔥 NO pasar body manualmente
    await transport.handleRequest(req, res);

  } catch (err) {
    console.error("🔥 MCP ERROR:", err);
    if (!res.headersSent) {
      res.status(500).end(String(err));
    }
  }
});

app.get("/", (_, res) => {
  res.json({ status: "MCP server running" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 MCP corriendo en puerto ${PORT}`);
});
