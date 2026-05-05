# FileFetch

A lightweight MCP tool for **Claude Code** that queries local files using a small, fast model.

> **Claude Code only.** FileFetch is built specifically for Claude Code and will not work with other MCP-compatible agents or tools. File content is processed through your own Claude Code setup — no additional third-party services involved.

FileFetch takes a file path and a question and returns a focused answer — keeping raw content out of the main context window. It mirrors the behaviour of [WebFetch](https://code.claude.com/docs/en/tools-reference), a built-in Claude Code tool: pass it a URL and a prompt, and it synthesises an answer from the fetched page using the same prompt-driven interface.

## Tools

| Tool | Input | Description |
|------|-------|-------------|
| `query` | `path`, `prompt` | Read a single file and answer a question about it |
| `queryAll` | `paths[]`, `prompt` | Read multiple files and return a single synthesised answer |

File content is extracted and processed by a small, fast model, keeping the main context window free.

## Why MCP

FileFetch is implemented as an MCP tool rather than a skill or shell script so that Claude discovers and calls it autonomously — the same way it calls built-in tools like WebFetch. When Claude decides it needs a one-off answer from a file, it can reach for `query` or `queryAll` without being explicitly told to. Skills and shell scripts require either user invocation or CLAUDE.md instructions to wire them in; MCP tools appear in Claude's tool list at session start and need no additional routing.

## Install via Homebrew

```bash
brew tap haywoodmarx/filefetch
brew install filefetch
claude mcp add --scope user FileFetch filefetch-core
```

Restart Claude Code.

## Manual install

```bash
git clone git@github.com:haywoodmarx/filefetch.git ~/.claude/mcp-servers/FileFetch
cd ~/.claude/mcp-servers/FileFetch
npm install
claude mcp add --scope user FileFetch node ~/.claude/mcp-servers/FileFetch/server.ts
```

Restart Claude Code.

## Uninstall

Homebrew does not run cleanup on uninstall, so remove the MCP registration first:

```bash
claude mcp remove FileFetch --scope user
brew uninstall filefetch
brew untap haywoodmarx/filefetch
```
