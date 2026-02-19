import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } 
  from "@modelcontextprotocol/sdk/server/streamableHttp.js";

const app = express();

/* 🔥 IMPORTANTE
   Usamos raw body para que el SDK reciba el body intacto.
   NO usar express.json()
*/
app.use("/mcp", express.raw({ type: "*/*" }));

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

const transport = new StreamableHTTPServerTransport();

await mcpServer.connect(transport);

app.use("/mcp", async (req, res) => {
  try {
    console.log("➡️ MCP REQUEST:", req.method);
    console.log("Headers:", req.headers);

    await transport.handleRequest(req, res, req.body);

    console.log("✅ MCP handled correctly");
  } catch (err) {
    console.error("🔥 MCP INTERNAL ERROR:");
    console.error(err);
    console.error(err?.stack);

    if (!res.headersSent) {
      res.status(500).json({
        error: "MCP crashed",
        message: err?.message,
        stack: err?.stack,
      });
    }
  }
});

/* Root simple para health check */
app.get("/", (_, res) => {
  res.json({ status: "MCP server running" });
});

/* 🔥 Captura global de errores */
process.on("uncaughtException", (err) => {
  console.error("🔥 UNCAUGHT EXCEPTION:");
  console.error(err);
});

process.on("unhandledRejection", (reason) => {
  console.error("🔥 UNHANDLED REJECTION:");
  console.error(reason);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 MCP corriendo en puerto ${PORT}`);
});
