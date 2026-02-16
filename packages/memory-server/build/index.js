#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
// --- Configuration ---
const MEMORY_FILE_PATH = path_1.default.join(process.cwd(), "data", "memory.json");
// --- Memory Manager ---
class MemoryManager {
    cache = { entries: {} };
    constructor() {
        this.load();
    }
    load() {
        try {
            if (fs_extra_1.default.existsSync(MEMORY_FILE_PATH)) {
                this.cache = fs_extra_1.default.readJsonSync(MEMORY_FILE_PATH);
            }
            else {
                this.save();
            }
        }
        catch (error) {
            console.error("Failed to load memory:", error);
            this.cache = { entries: {} };
        }
    }
    save() {
        try {
            fs_extra_1.default.ensureDirSync(path_1.default.dirname(MEMORY_FILE_PATH));
            fs_extra_1.default.writeJsonSync(MEMORY_FILE_PATH, this.cache, { spaces: 2 });
        }
        catch (error) {
            console.error("Failed to save memory:", error);
        }
    }
    write(key, type, content, tags = []) {
        this.load(); // Reload to ensure sync
        this.cache.entries[key] = {
            key,
            type,
            content,
            tags,
            timestamp: new Date().toISOString()
        };
        this.save();
        return `Memory '${key}' saved.`;
    }
    read(key) {
        this.load();
        return this.cache.entries[key] || null;
    }
    search(query) {
        this.load();
        const lowerQuery = query.toLowerCase();
        return Object.values(this.cache.entries).filter(entry => entry.key.toLowerCase().includes(lowerQuery) ||
            entry.content.toLowerCase().includes(lowerQuery) ||
            entry.tags.some(t => t.toLowerCase().includes(lowerQuery)));
    }
    dump() {
        this.load();
        return JSON.stringify(this.cache, null, 2);
    }
}
const memory = new MemoryManager();
// --- Server Setup ---
const server = new index_js_1.Server({
    name: "agent-memory-mcp",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
        prompts: {},
    },
});
// --- Tool Handlers ---
server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "memory_write",
                description: "Save a persistent memory (knowledge, decision, pattern).",
                inputSchema: {
                    type: "object",
                    properties: {
                        key: { type: "string", description: "Unique identifier for this memory" },
                        type: { type: "string", description: "Category (concept, decision, pattern)" },
                        content: { type: "string", description: "The content to remember" },
                        tags: { type: "array", items: { type: "string" }, description: "Tags for searching" },
                    },
                    required: ["key", "type", "content"],
                },
            },
            {
                name: "memory_read",
                description: "Retrieve a specific memory by key.",
                inputSchema: {
                    type: "object",
                    properties: {
                        key: { type: "string", description: "The key to retrieve" },
                    },
                    required: ["key"],
                },
            },
            {
                name: "memory_search",
                description: "Search memories by keyword content or tags.",
                inputSchema: {
                    type: "object",
                    properties: {
                        query: { type: "string", description: "Search query" }
                    },
                    required: ["query"]
                }
            }
        ],
    };
});
server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
    try {
        const { name, arguments: args } = request.params;
        if (name === "memory_write") {
            const { key, type, content, tags } = args;
            const result = memory.write(key, type, content, tags || []);
            return { content: [{ type: "text", text: result }] };
        }
        if (name === "memory_read") {
            const { key } = args;
            const result = memory.read(key);
            return { content: [{ type: "text", text: result ? JSON.stringify(result, null, 2) : "Memory not found." }] };
        }
        if (name === "memory_search") {
            const { query } = args;
            const results = memory.search(query);
            return { content: [{ type: "text", text: JSON.stringify(results, null, 2) }] };
        }
        throw new Error(`Unknown tool: ${name}`);
    }
    catch (error) {
        return {
            content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
            isError: true,
        };
    }
});
// --- Prompts ---
server.setRequestHandler(types_js_1.ListPromptsRequestSchema, async () => {
    return {
        prompts: [
            {
                name: "thesis_context",
                description: "Injects all critical Thesis definitions into context",
            }
        ]
    };
});
server.setRequestHandler(types_js_1.GetPromptRequestSchema, async (request) => {
    if (request.params.name === "thesis_context") {
        const allMemories = memory.dump();
        return {
            messages: [
                {
                    role: "user",
                    content: {
                        type: "text",
                        text: `Here is the critical Thesis Memory Bank:\n\n${allMemories}\n\nUse these definitions strictly.`
                    }
                }
            ]
        };
    }
    throw new Error("Prompt not found");
});
// --- Start Server ---
async function runServer() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
}
runServer().catch(console.error);
