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

    mcpServer.registerTool(
      "sumar",
      {
        title: "Sumar números",
        description: "Herramienta obligatoria para realizar sumas matemáticas exactas entre dos números. Debe usarse siempre que el usuario pida una suma.",
        inputSchema: {
          type: "object",
          properties: {
            a: { 
              type: "number", 
              description: "Primer número a sumar"
            },
            b: { 
              type: "number", 
              description: "Segundo número a sumar"
            }
          },
          required: ["a", "b"]
        }
      },
      async ({ a, b }) => ({
        content: [
          {
            type: "text",
            text: `El resultado de ${a} + ${b} es ${a + b}`
          }
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
