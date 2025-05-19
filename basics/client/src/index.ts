import { Anthropic } from "@anthropic-ai/sdk";
import {
  MessageParam,
  Tool,
} from "@anthropic-ai/sdk/resources/messages/messages.mjs";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import readline from "readline/promises";
import dotenv from "dotenv";

dotenv.config();

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const JWT_TOKEN = process.env.JWT_TOKEN;

if (!ANTHROPIC_API_KEY) {
  throw new Error("ANTHROPIC_API_KEY is not set");
}

if (!JWT_TOKEN) {
  throw new Error("JWT_TOKEN is not set");
}

let serverUrl = "http://localhost:3001/mcp";

let client: Client | null = null;
let transport: StreamableHTTPClientTransport | null = null;
let notificationsToolLastEventId: string | undefined = undefined;
let sessionId: string | undefined = undefined;

async function main() {
  console.log("MCP Interactive Client");
  console.log("=====================");

  await connect();
}

async function connect(url?: string): Promise<void> {
  console.log(`Connecting to ${serverUrl}...`);

  const client = new Client({
    name: "mcp client",
    version: "1.0.0",
  });

  const transport = new StreamableHTTPClientTransport(new URL(serverUrl), {
    sessionId: sessionId,
    requestInit: {
      headers: JWT_TOKEN ? { authorization: JWT_TOKEN } : {},
    },
  });

  await client.connect(transport);
  sessionId = transport.sessionId;
  console.log("Transport created with session ID:", sessionId);
  console.log("Connected to MCP server");

  const toolsResult = await client.listTools();
  const tools = toolsResult.tools.map((tool) => {
    return {
      name: tool.name,
      description: tool.description,
      input_schema: tool.inputSchema,
    };
  });
  console.log(
    "Connected to server with tools:",
    tools.map(({ name }) => name)
  );

  const promptResult = await client.listPrompts();
  const prompts = promptResult.prompts.map((prompt) => {
    return {
      name: prompt.name,
      description: prompt.description,
    };
  });

  console.log(
    "Connected to server with prompts:",
    prompts.map(({ name }) => name)
  );

  const resourcesResult = await client.listResources();
  const resources = resourcesResult.resources.map((resource) => {
    return {
      name: resource.name,
      description: resource.description,
    };
  });

  console.log(
    "Connected to server with resources:",
    resources.map(({ name }) => name)
  );
}

main();
