const express = require("express");
const { readFileSync } = require("fs");
const { join } = require("path");
const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StreamableHTTPServerTransport } = require("@modelcontextprotocol/sdk/server/streamableHttp.js");

const WEB_DIST = join(__dirname, "dist");
const JS_INPUT = readFileSync(join(WEB_DIST, "input-text.js"), "utf8");

const mcpServer = new McpServer({
  name: "sum-server",
  version: "1.0.0",
});

mcpServer.registerResource(
  "calculator-widget",
  "ui://widget/calculator.html",
  {
    title: "Calculadora",
    description: "Formulario interactivo para sumar números",
  },
  async () => ({
    contents: [
      {
        uri: "ui://widget/calculator.html",
        mimeType: "text/html+skybridge",
        text: `
          <div id="root"></div>
          <script type="module">
            ${JS_INPUT}
          </script>
        `,
      },
    ],
  })
);

mcpServer.registerTool(
  "abrir-calculadora",
  {
    title: "Abrir calculadora",
    description: "Abre una calculadora interactiva",
    _meta: {
      "openai/outputTemplate": "ui://widget/calculator.html",
    },
  },
  async () => ({
    structuredContent: {},
  })
);

mcpServer.registerTool(
  "suma",
  {
    title: "Sumar números",
    description: "Suma dos números",
  },
  async ({ a, b }) => {
    if (typeof a !== "number" || typeof b !== "number") {
      throw new Error("a y b deben ser números");
    }

    return {
      structuredContent: {
        resultado: a + b,
      },
    };
  }
);

const app = express();
app.use(express.json());

const transport = new StreamableHTTPServerTransport({
  sessionIdGenerator: undefined,
  enableJsonResponse: true,
});

mcpServer.connect(transport);

app.all("/mcp", async (req, res) => {
  try {
    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    console.error("MCP error:", err);
    res.status(500).end(String(err));
  }
});

app.get("/", (req, res) => {
  res.json({ status: "MCP server running" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 MCP Server corriendo en http://localhost:${PORT}/mcp`);
});
