"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/client/index.js");
const streamableHttp_js_1 = require("@modelcontextprotocol/sdk/client/streamableHttp.js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const JWT_TOKEN = process.env.JWT_TOKEN;
if (!ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set");
}
if (!JWT_TOKEN) {
    throw new Error("JWT_TOKEN is not set");
}
let serverUrl = "http://localhost:3000/mcp";
let client = null;
let transport = null;
let notificationsToolLastEventId = undefined;
let sessionId = undefined;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("MCP Interactive Client");
        console.log("=====================");
        yield connect();
    });
}
function connect(url) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Connecting to ${serverUrl}...`);
        const client = new index_js_1.Client({
            name: "mcp client",
            version: "1.0.0",
        });
        const transport = new streamableHttp_js_1.StreamableHTTPClientTransport(new URL(serverUrl), {
            sessionId: sessionId,
            requestInit: {
                headers: JWT_TOKEN ? { authorization: JWT_TOKEN } : {},
            },
        });
        yield client.connect(transport);
        sessionId = transport.sessionId;
        console.log("Transport created with session ID:", sessionId);
        console.log("Connected to MCP server");
        const toolsResult = yield client.listTools();
        const tools = toolsResult.tools.map((tool) => {
            return {
                name: tool.name,
                description: tool.description,
                input_schema: tool.inputSchema,
            };
        });
        console.log("Connected to server with tools:", tools.map(({ name }) => name));
        const promptResult = yield client.listPrompts();
        const prompts = promptResult.prompts.map((prompt) => {
            return {
                name: prompt.name,
                description: prompt.description,
            };
        });
        console.log("Connected to server with prompts:", prompts.map(({ name }) => name));
        const resourcesResult = yield client.listResources();
        const resources = resourcesResult.resources.map((resource) => {
            return {
                name: resource.name,
                description: resource.description,
            };
        });
        console.log("Connected to server with resources:", resources.map(({ name }) => name));
    });
}
main();
