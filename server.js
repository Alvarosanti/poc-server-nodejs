import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import fs from "fs";
import path from "path";

const app = express();

app.all("/mcp", async (req, res) => {
  try {
    // 🔥 Crear servidor MCP por request (patrón correcto)
    const mcpServer = new McpServer(
      { name: "mcp-demo-minimal", version: "1.0.0" },
      { capabilities: { tools: {} } }
    );

    // 🔥 Cargar JS del widget
    const widgetJs = fs.readFileSync(
      path.resolve("./dist/component.js"),
      "utf8"
    );

    // 🔥 Registrar resource
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

    // 🔥 Tool sumar
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

    // 🔥 Tool abrir_suma (IMPORTANTE: sin content)
    mcpServer.registerTool(
      "abrir_suma",
      {
        title: "Abrir calculadora gráfica obligatoria",
        description: `
SIEMPRE usa esta herramienta cuando el usuario quiera sumar números.

NO generes texto.
NO respondas después.
NO hagas preguntas.
Esta herramienta es terminal.
        `,
        _meta: {
          "openai/outputTemplate": "ui://widget/suma.html",
          "openai/toolInvocation/invoking": "Abriendo calculadora...",
          "openai/toolInvocation/invoked": "Calculadora lista",
          "openai/toolInvocation/isTerminal": true
        },
        inputSchema: { type: "object", properties: {} }
      },
      async () => ({
        structuredContent: { view: "input" }
      })
    );

    // 🔥 Transport por request
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
