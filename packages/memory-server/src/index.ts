#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    ListPromptsRequestSchema,
    GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs-extra";
import path from "path";

// --- Configuration ---
const MEMORY_FILE_PATH = path.join(process.cwd(), "data", "memory.json");

// --- Types ---
interface MemoryEntry {
    key: string;
    type: string;
    content: string;
    tags: string[];
    timestamp: string;
}

interface MemoryBank {
    entries: Record<string, MemoryEntry>;
}

// --- Memory Manager ---
class MemoryManager {
    private cache: MemoryBank = { entries: {} };

    constructor() {
        this.load();
    }

    private load() {
        try {
            if (fs.existsSync(MEMORY_FILE_PATH)) {
                this.cache = fs.readJsonSync(MEMORY_FILE_PATH);
            } else {
                this.save();
            }
        } catch (error) {
            console.error("Failed to load memory:", error);
            this.cache = { entries: {} };
        }
    }

    private save() {
        try {
            fs.ensureDirSync(path.dirname(MEMORY_FILE_PATH));
            fs.writeJsonSync(MEMORY_FILE_PATH, this.cache, { spaces: 2 });
        } catch (error) {
            console.error("Failed to save memory:", error);
        }
    }

    public write(key: string, type: string, content: string, tags: string[] = []) {
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

    public read(key: string): MemoryEntry | null {
        this.load();
        return this.cache.entries[key] || null;
    }

    public search(query: string): MemoryEntry[] {
        this.load();
        const lowerQuery = query.toLowerCase();
        return Object.values(this.cache.entries).filter(entry =>
            entry.key.toLowerCase().includes(lowerQuery) ||
            entry.content.toLowerCase().includes(lowerQuery) ||
            entry.tags.some(t => t.toLowerCase().includes(lowerQuery))
        );
    }

    public dump(): string {
        this.load();
        return JSON.stringify(this.cache, null, 2);
    }
}

const memory = new MemoryManager();

// --- Server Setup ---
const server = new Server(
    {
        name: "agent-memory-mcp",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
            prompts: {},
        },
    }
);

// --- Tool Handlers ---
server.setRequestHandler(ListToolsRequestSchema, async () => {
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

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        const { name, arguments: args } = request.params;

        if (name === "memory_write") {
            const { key, type, content, tags } = args as any;
            const result = memory.write(key, type, content, tags || []);
            return { content: [{ type: "text", text: result }] };
        }

        if (name === "memory_read") {
            const { key } = args as any;
            const result = memory.read(key);
            return { content: [{ type: "text", text: result ? JSON.stringify(result, null, 2) : "Memory not found." }] };
        }

        if (name === "memory_search") {
            const { query } = args as any;
            const results = memory.search(query);
            return { content: [{ type: "text", text: JSON.stringify(results, null, 2) }] };
        }

        throw new Error(`Unknown tool: ${name}`);
    } catch (error) {
        return {
            content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
            isError: true,
        };
    }
});

// --- Prompts ---
server.setRequestHandler(ListPromptsRequestSchema, async () => {
    return {
        prompts: [
            {
                name: "thesis_context",
                description: "Injects all critical Thesis definitions into context",
            }
        ]
    };
});

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
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
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

runServer().catch(console.error);
