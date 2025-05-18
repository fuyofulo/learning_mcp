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
Object.defineProperty(exports, "__esModule", { value: true });
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const streamableHttp_js_1 = require("@modelcontextprotocol/sdk/server/streamableHttp.js");
const node_crypto_1 = require("node:crypto");
const zod_1 = require("zod");
const server = new mcp_js_1.McpServer({
    name: "basic server",
    version: "1.0.0",
});
server.tool("greet", "greets the user nicely", { name: zod_1.z.string() }, (_a) => __awaiter(void 0, [_a], void 0, function* ({ name }) {
    return {
        content: [{ type: "text", text: `hello ${name}` }],
    };
}));
server.resource("simpleText", "mcp://example/greeting", { description: "A simple greeting text", mimeType: "text/plain", }, () => __awaiter(void 0, void 0, void 0, function* () {
    return {
        contents: [
            {
                uri: "mcp://example/greeting",
                text: "Hello from MCP resource!",
            },
        ],
    };
}));
server.prompt("greeting", "A friendly greeting template", { name: zod_1.z.string().describe("Name to greet") }, (_a) => __awaiter(void 0, [_a], void 0, function* ({ name }) {
    return {
        messages: [
            { role: "user", content: { type: "text", text: `Say hi to ${name} in a friendly way!` } },
            { role: "assistant", content: { type: "text", text: `Hey ${name}! How's it going? Great to meet you!` } },
        ],
    };
}));
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const transport = new streamableHttp_js_1.StreamableHTTPServerTransport({
        sessionIdGenerator: () => (0, node_crypto_1.randomUUID)(),
    });
    yield server.connect(transport);
    console.log("server started");
});
main().catch((err) => console.error("Failed to start server:", err));
