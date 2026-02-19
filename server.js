import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } 
  from "@modelcontextprotocol/sdk/server/streamableHttp.js";

const app = express();

/* 🔥 Un solo endpoint /mcp */
app.all("/mcp", express.raw({ type: "*/*" }), async (req, res) => {
  try {
    // Convertir body si es POST
    const body =
      req.method === "POST" && req.body
        ? req.body.toString("utf8")
        : undefined;

    // 🔥 Crear server nuevo por request
    const mcpServer = new McpServer(
      {
        name: "mcp-demo-minimal",
        version: "1.0.0",
      },
      {
        capabilities: { tools: {} }
      }
    );

    // Registrar tool
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

    // 🔥 Crear transport nuevo por request
    const transport = new StreamableHTTPServerTransport({
      keepAlive: true
    });

    await mcpServer.connect(transport);

    await transport.handleRequest(req, res, body);

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
