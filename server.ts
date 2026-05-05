#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { handleQuery, handleQueryAll } from "./lib.ts";

const server = new McpServer({ name: "FileFetch", version: "1.0.0" });

server.tool(
  "query",
  `Fetches content from a local file and processes it using a small, fast model.
- Use this tool when you need to retrieve and analyze file content without loading it into the main context window
- The prompt should describe what information you want to extract from the file
- This tool is read-only and does not modify any files
- Results may be summarized if the content is very large
- Do not use for files you are actively editing or will reference repeatedly this session — use the Read tool directly for those
- Do not use for source code under active modification — full fidelity matters when writing or reviewing code
- Best suited for one-off lookups: configuration files, documentation, logs, specs, or any file you need a quick answer from without consuming context`,
  {
    path: z.string().describe("The absolute path to the file to read"),
    prompt: z.string().describe("The prompt to run on the fetched content"),
  },
  (args) => handleQuery(args),
);

server.tool(
  "queryAll",
  `Fetches content from multiple local files and processes their combined content using a small, fast model.
- Use this tool when you need to retrieve and analyze content across multiple files without loading them all into the main context window
- The prompt should describe what information you want to extract or synthesise across the files
- This tool is read-only and does not modify any files
- Results may be summarized if the content is very large
- Do not use for files you are actively editing or will reference repeatedly this session — use the Read tool directly for those
- Do not use for source code under active modification — full fidelity matters when writing or reviewing code
- Best suited for one-off cross-file lookups: comparing configurations, scanning documentation, reviewing specs, or any set of files you need a quick synthesised answer from`,
  {
    paths: z.array(z.string()).min(2).describe("The absolute paths of the files to read"),
    prompt: z.string().describe("The prompt to run on the fetched content"),
  },
  (args) => handleQueryAll(args),
);

const transport = new StdioServerTransport();
await server.connect(transport);
