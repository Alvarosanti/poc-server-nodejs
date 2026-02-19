import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

const app = express();

app.use("/static", express.static("dist"));

// 🔥 Crear servidor MCP UNA sola vez
const mcpServer = new McpServer(
  { name: "mcp-demo-minimal", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// ---------- RESOURCE ----------
mcpServer.registerResource(
  "sum-widget",
  "ui://widget/suma.html",
  { title: "Calculadora" },
  async () => ({
    contents: [{
      uri: "ui://widget/suma.html",
      mimeType: "text/html+skybridge",
      text: `
        <div style="padding:20px">
          <h2>TEST UI</h2>
        </div>
      `
    }]
  })
);

// ---------- TOOL ----------
mcpServer.registerTool(
  "abrir_suma",
  {
    title: "Abrir calculadora",
    description: "Usa esta herramienta cuando el usuario quiera sumar números.",
    _meta: {
      "openai/outputTemplate": "ui://widget/suma.html",
      "openai/toolInvocation/invoking": "Abriendo calculadora...",
      "openai/toolInvocation/invoked": "Calculadora lista"
    },
    inputSchema: { type: "object", properties: {} }
  },
  async () => ({
    structuredContent: { view: "input" }
  })
);

// 🔥 Crear transport UNA sola vez
const transport = new StreamableHTTPServerTransport({
  keepAlive: true
});

await mcpServer.connect(transport);

// Solo manejar requests
app.all("/mcp", async (req, res) => {
  await transport.handleRequest(req, res);
});

app.listen(process.env.PORT || 3000);
