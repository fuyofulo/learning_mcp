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
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const streamableHttp_js_1 = require("@modelcontextprotocol/sdk/server/streamableHttp.js");
const http_1 = require("http");
const crypto_1 = require("crypto");
const zod_1 = require("zod");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("dotenv/config");
// Get secret from env or use default
const SECRET = "ASDF123";
// Create MCP server with tools
const mcp = new mcp_js_1.McpServer({ name: "basic server", version: "1.0.0" });
// Add greeting tool
mcp.tool("greet", "greets the user nicely", { name: zod_1.z.string() }, (_a) => __awaiter(void 0, [_a], void 0, function* ({ name }) {
    return ({
        content: [{ type: "text", text: `hello ${name}` }],
    });
}));
// Add text resource
mcp.resource("simpleText", "mcp://example/greeting", { description: "A simple greeting text", mimeType: "text/plain" }, () => __awaiter(void 0, void 0, void 0, function* () {
    return ({
        contents: [
            { uri: "mcp://example/greeting", text: "Hello from MCP resource!" },
        ],
    });
}));
// Add prompt template
mcp.prompt("greeting", "A friendly greeting template", { name: zod_1.z.string().describe("Name to greet") }, (_a) => __awaiter(void 0, [_a], void 0, function* ({ name }) {
    return ({
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
    });
}));
// Simple session management
const sessions = new Map();
// Track when a new session is created
function onSessionInitialized(sessionId) {
    console.log(`New session created: ${sessionId}`);
    sessions.set(sessionId, {
        createdAt: new Date(),
        lastAccessed: new Date(),
    });
}
// Set up transport with session management
const transport = new streamableHttp_js_1.StreamableHTTPServerTransport({
    sessionIdGenerator: crypto_1.randomUUID,
    onsessioninitialized: onSessionInitialized,
});
mcp.connect(transport);
// Simple auth check
function authenticate(req, res) {
    try {
        const token = req.headers.authorization;
        const decoded = jsonwebtoken_1.default.verify(token, SECRET);
        if (!decoded) {
            console.log("unauthorized");
            return false;
        }
        // Update session last accessed time if session exists
        const sessionId = req.headers["mcp-session-id"];
        if (sessionId && sessions.has(sessionId)) {
            const session = sessions.get(sessionId);
            session.lastAccessed = new Date();
            sessions.set(sessionId, session);
        }
        return true;
    }
    catch (error) {
        console.error(error);
        return false;
    }
}
function handleRequest(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        // Require JWT authentication for every request
        if (!authenticate(req, res)) {
            res.writeHead(401).end('{"error":"unauthorized"}');
            return;
        }
        // MCP endpoint
        if ((_a = req.url) === null || _a === void 0 ? void 0 : _a.startsWith("/mcp")) {
            yield transport.handleRequest(req, res);
            return;
        }
        // 404 for everything else
        res.writeHead(404).end('{"error":"Not found"}');
    });
}
// Start server
(0, http_1.createServer)(handleRequest).listen(3000, () => console.log("Server running at http://localhost:3000 - use jwt token for auth"));
