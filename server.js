const express = require("express");
const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StreamableHTTPServerTransport } = require("@modelcontextprotocol/sdk/server/streamableHttp.js");


const mcpServer = new McpServer({
  name: "math-server",
  version: "1.0.0",
});

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
      content: [
        {
          type: "text",
          text: `El resultado de ${a} + ${b} es ${a + b}`,
        },
      ],
      structuredContent: {
        resultado: a + b,
      },
    };
  }
);

mcpServer.registerTool(
  "resta",
  {
    title: "Restar números",
    description: "Resta dos números y devuelve el resultado",
  },
  async ({ a, b }) => {
    if (typeof a !== "number" || typeof b !== "number") {
      throw new Error("a y b deben ser números");
    }

    return {
      content: [
        {
          type: "text",
          text: `El resultado de ${a} - ${b} es ${a - b}`,
        },
      ],
      structuredContent: {
        resultado: a - b,
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
  res.json({ status: "Math MCP server running" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 MCP Server corriendo en http://localhost:${PORT}/mcp`);
});
