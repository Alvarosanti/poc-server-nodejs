import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } 
  from "@modelcontextprotocol/sdk/server/streamableHttp.js";

const app = express();

const mcpServer = new McpServer(
  {
    name: "mcp-demo-minimal",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {}
    }
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
        text: `¡Hola, ${name}! Bienvenido al MCP demo 🚀`
      }
    ]
  })
);

const transport = new StreamableHTTPServerTransport({
  keepAlive: true
});

await mcpServer.connect(transport);

/* 🔥 GET (SSE) */
app.get("/mcp", async (req, res) => {
  try {
    await transport.handleRequest(req, res);
  } catch (err) {
    console.error("🔥 GET ERROR:", err);
    if (!res.headersSent) {
      res.status(500).end(String(err));
    }
  }
});

/* 🔥 POST (JSON-RPC) */
app.post("/mcp", express.raw({ type: "*/*" }), async (req, res) => {
  try {
    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    console.error("🔥 POST ERROR:", err);
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
