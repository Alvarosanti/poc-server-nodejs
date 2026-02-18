const express = require("express");
const { EventEmitter } = require("events");

const app = express();
app.use(express.json());

const broadcaster = new EventEmitter();
broadcaster.setMaxListeners(0);

let masterConnected = false;

app.all("/mcp", async (req, res) => {
  const wantsSse =
    req.method === "GET" &&
    (req.headers.accept?.includes("text/event-stream") ||
      req.headers["user-agent"]?.includes("curl"));

  if (wantsSse) {
    if (masterConnected) {
      res.status(409).json({ error: "SSE already connected." });
      return;
    }

    masterConnected = true;

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    res.flushHeaders?.();

    const transport = new StreamableHTTPServerTransport({
      enableJsonResponse: true,
    });

    await mcpServer.connect(transport);

    const origWrite = res.write.bind(res);

    res.write = (chunk) => {
      try {
        broadcaster.emit("model-chunk", chunk);
      } catch {}
      return origWrite(chunk);
    };

    req.on("close", () => {
      masterConnected = false;
      broadcaster.emit("transport-closed");
      try { res.end(); } catch {}
    });

    try {
      await transport.handleRequest(req, res, req.body);
    } catch (err) {
      console.error("SSE error:", err);
      broadcaster.emit("transport-error", err);
      try { res.end(); } catch {}
    }

    return;
  }

  // POST / DELETE requests
  try {
    const transport = new StreamableHTTPServerTransport({
      enableJsonResponse: true,
    });

    await mcpServer.connect(transport);
    await transport.handleRequest(req, res, req.body);

  } catch (err) {
    console.error("MCP error:", err);
    res.status(500).end(String(err));
  }
});

// Root para verificar que el server vive
app.get("/", (req, res) => {
  res.json({ status: "MCP server running" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 MCP Server corriendo en http://localhost:${PORT}/mcp`);
});
