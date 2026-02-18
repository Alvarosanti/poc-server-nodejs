const express = require("express");
const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StreamableHTTPServerTransport } = require("@modelcontextprotocol/sdk/server/streamableHttp.js");
const { readFileSync } = require("fs");
const { join } = require("path");

const WEB_DIST = join(__dirname, "dist");

const JS_INPUT = readFileSync(join(WEB_DIST, "input-text.js"), "utf8");
const JS_CREDIT = readFileSync(join(WEB_DIST, "credit-card.js"), "utf8");
const CSS = readFileSync(join(WEB_DIST, "styles.css"), "utf8");

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
          <style>${CSS}</style>
          <div id="root"></div>
          <script type="module">
            ${JS_INPUT}
          </script>
        `,
      },
    ],
  })
);

mcpServer.registerResource(
  "credit-card-widget",
  "ui://widget/credit-card.html",
  {
    title: "Tarjetas disponibles",
    description: "Visualiza las tarjetas de crédito disponibles",
  },
  async () => ({
    contents: [
      {
        uri: "ui://widget/credit-card.html",
        mimeType: "text/html+skybridge",
        text: `
          <style>${CSS}</style>
          <div id="root"></div>
          <script type="module">
            ${JS_CREDIT}
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
    description: "Abre una calculadora interactiva para sumar números",
    _meta: {
      "openai/outputTemplate": "ui://widget/calculator.html",
    },
  },
  async () => ({
    structuredContent: {},
  })
);

mcpServer.registerTool(
  "mostrar-tarjetas",
  {
    title: "Mostrar tarjetas",
    description: "Muestra las tarjetas de crédito disponibles",
    _meta: {
      "openai/outputTemplate": "ui://widget/credit-card.html",
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
    description: "Suma dos números y devuelve el resultado",
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

app.post("/mcp", async (req, res) => {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  await mcpServer.connect(transport);
  await transport.handleRequest(req, res);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 MCP Server corriendo en http://localhost:${PORT}/mcp`);
});