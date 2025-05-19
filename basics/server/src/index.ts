import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createServer, IncomingMessage, ServerResponse } from "http";
import { randomUUID } from "crypto";
import { z } from "zod";
import jwt from "jsonwebtoken";
import "dotenv/config";

// Get secret from env or use default
const SECRET = "ASDF123";

// Create MCP server with tools
const mcp = new McpServer({ name: "basic server", version: "1.0.0" });

// Add greeting tool
mcp.tool(
  "greet",
  "greets the user nicely",
  { name: z.string() },
  async ({ name }) => ({
    content: [{ type: "text", text: `hello ${name}` }],
  })
);

// Add text resource
mcp.resource(
  "simpleText",
  "mcp://example/greeting",
  { description: "A simple greeting text", mimeType: "text/plain" },
  async () => ({
    contents: [
      { uri: "mcp://example/greeting", text: "Hello from MCP resource!" },
    ],
  })
);

// Add prompt template
mcp.prompt(
  "greeting",
  "A friendly greeting template",
  { name: z.string().describe("Name to greet") },
  async ({ name }) => ({
    messages: [
      {
        role: "user",
        content: { type: "text", text: `Say hi to ${name} in a friendly way!` },
      },
      {
        role: "assistant",
        content: { type: "text", text: `Hey ${name}! How's it going?` },
      },
    ],
  })
);

// Simple session management
const sessions = new Map();

// Track when a new session is created
function onSessionInitialized(sessionId: string) {
  console.log(`New session created: ${sessionId}`);
  sessions.set(sessionId, {
    createdAt: new Date(),
    lastAccessed: new Date(),
  });
}

// Set up transport with session management
const transport = new StreamableHTTPServerTransport({
  sessionIdGenerator: randomUUID,
  onsessioninitialized: onSessionInitialized,
});

mcp.connect(transport);

// Simple auth check
function authenticate(req: IncomingMessage, res: ServerResponse): boolean {
  try {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token!, SECRET!);
    if (!decoded) {
      console.log("unauthorized");
      return false;
    }

    // Update session last accessed time if session exists
    const sessionId = req.headers["mcp-session-id"] as string;
    if (sessionId && sessions.has(sessionId)) {
      const session = sessions.get(sessionId);
      session.lastAccessed = new Date();
      sessions.set(sessionId, session);
    }

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function handleRequest(req: IncomingMessage, res: ServerResponse) {
  // Require JWT authentication for every request
  if (!authenticate(req, res)) {
    res.writeHead(401).end('{"error":"unauthorized"}');
    return;
  }

  // MCP endpoint
  if (req.url?.startsWith("/mcp")) {
    await transport.handleRequest(req, res);
    return;
  }

  // 404 for everything else
  res.writeHead(404).end('{"error":"Not found"}');
}

// Start server
createServer(handleRequest).listen(3001, () =>
  console.log(
    "Server running at http://localhost:3001 - use jwt token for auth"
  )
);
