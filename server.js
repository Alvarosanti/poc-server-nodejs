import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import fs from "fs";
import path from "path";

const app = express();

// 🔥 MCP SERVER GLOBAL (una sola vez)
const mcpServer = new McpServer(
  { name: "mcp-demo-minimal", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// 🔥 Registrar resources UNA sola vez
const widgetJs = fs.readFileSync(
  path.resolve("./dist/component.js"),
  "utf8"
);

mcpServer.registerResource(
  "sum-widget",
  "ui://widget/suma.html",
  { title: "Calculadora" },
  async () => ({
    contents: [{
      uri: "ui://widget/suma.html",
      mimeType: "text/html+skybridge",
      text: `
        <div id="root"></div>
        <script type="module">
          ${widgetJs}
        </script>
      `
    }]
  })
);

// 🔥 Registrar tools UNA sola vez
mcpServer.registerTool(
  "sumar",
  {
    title: "Sumar números",
    description: "Herramienta obligatoria para sumar números.",
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
    content: [{ type: "text", text: `Resultado: ${a + b}` }],
    structuredContent: { resultado: a + b }
  })
);

mcpServer.registerTool(
  "abrir_suma",
  {
    title: "Abrir calculadora gráfica obligatoria",
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

// 🔥 EXPRESS HANDLER (transport por request)
app.all("/mcp", async (req, res) => {
  try {
    const transport = new StreamableHTTPServerTransport({
      keepAlive: true
    });

    await mcpServer.connect(transport);
    await transport.handleRequest(req, res);

  } catch (err) {
    console.error("🔥 MCP ERROR:", err);
    if (!res.headersSent) {
      res.status(500).end(String(err));
    }
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("🚀 MCP corriendo");
});
