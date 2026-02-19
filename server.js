import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { HttpClientTransport } from "@modelcontextprotocol/sdk/client/http.js"
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js"

const server = new Server(

  {
    name: "mcp-demo-minimal",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {}
    }
  }
)

server.setRequestHandler(ListToolsRequestSchema, async (request) => {
  return {
    tools: [
      {
        name: "greet",
        description: "Saludar a la persona por su nombre",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "El nombre de la persona a saludar"
            }
          },
          required: ["name"]
        }
      }
    ]
  }
})

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, "argument": args } = request.params;
  if (name === "greet") {
    const { name: personName } = args
    return {
      content: [
        {
          type: "text",
          text: `¡Hola, ${name}! bienvenidu a mcp demo`
        }
      ]
    }
  }
  throw new Error(`Tool ${toolName} no encontrada`)
})

async function main() {
  const transport = new HttpClientTransport()
  await server.connect(transport)
  console.log('demo started')
}
main().catch((error) => {
  console.error("Error en el servidor:", error)
  process.exit(1)
})
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});