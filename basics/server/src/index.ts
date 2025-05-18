import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { randomUUID } from "node:crypto";
import { z } from "zod";

const server = new McpServer({
  name: "basic server",
  version: "1.0.0",
});

server.tool("greet","greets the user nicely",{ name: z.string() },
  async ({ name }) => {
    return {
      content: [{ type: "text", text: `hello ${name}` }],
    };
  }
);

server.resource("simpleText","mcp://example/greeting", {  description: "A simple greeting text",  mimeType: "text/plain",},
  async () => {
    return {
      contents: [
        {
          uri: "mcp://example/greeting",
          text: "Hello from MCP resource!",
        },
      ],
    };
  }
);

server.prompt("greeting","A friendly greeting template",{ name: z.string().describe("Name to greet") },
  async ({ name }) => {
      return {
        messages: [
          { role: "user", content: { type: "text", text: `Say hi to ${name} in a friendly way!` } },
          { role: "assistant", content: { type: "text", text: `Hey ${name}! How's it going? Great to meet you!` } },
        ],
      };
    }
);

const main = async () => {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
  });
  await server.connect(transport);
  console.log("server started");
};

main().catch((err) => console.error("Failed to start server:", err));


