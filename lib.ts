import { readFileSync } from "fs";
import { spawnSync } from "child_process";

const MAX_BUFFER_BYTES = 10 * 1024 * 1024; // 10 MB

/** The structured response format expected by MCP tool handlers. */
export interface ToolResponse {
  content: { type: string; text: string }[];
  isError?: boolean;
}

/** Sends content to a language model with a prompt and returns the response. */
function queryWithModel(content: string, prompt: string): { content: string } | { error: string } {
  const result = spawnSync("claude", ["-p", prompt, "--model", "haiku", "--effort", "low", "--tools", ""], {
    input: content,
    encoding: "utf8",
    maxBuffer: MAX_BUFFER_BYTES,
  });

  if (result.status !== 0) {
    return { error: result.stderr || result.error?.message || "Unknown error" };
  }

  return { content: result.stdout };
}

/**
 * Reads a single file and processes its content through a language model
 * to answer the given prompt.
 */
export async function handleQuery({ path, prompt }: { path: string; prompt: string }): Promise<ToolResponse> {
  let content: string;
  try {
    content = readFileSync(path, "utf8");
  } catch (e) {
    return errorResponse(`Error reading file: ${e instanceof Error ? e.message : e}`);
  }

  const modelResult = queryWithModel(content, prompt);
  if ("error" in modelResult) {
    return errorResponse(`Error from model: ${modelResult.error}`);
  }

  return successResponse(modelResult.content);
}

/**
 * Reads multiple files, combines their content with path separators,
 * and processes the combined content through a language model
 * to produce a single synthesised answer.
 *
 * Files that fail to read are included in the combined content as
 * error markers so the model can report partial results.
 */
export async function handleQueryAll({ paths, prompt }: { paths: string[]; prompt: string }): Promise<ToolResponse> {
  const combinedContent = paths
    .map((filePath) => {
      try {
        return `--- ${filePath} ---\n${readFileSync(filePath, "utf8")}`;
      } catch (e) {
        return `--- ${filePath} ---\nError: ${e instanceof Error ? e.message : e}`;
      }
    })
    .join("\n");

  const modelResult = queryWithModel(combinedContent, prompt);
  if ("error" in modelResult) {
    return errorResponse(`Error from model: ${modelResult.error}`);
  }

  return successResponse(modelResult.content);
}

function successResponse(text: string): ToolResponse {
  return { content: [{ type: "text", text }] };
}

function errorResponse(text: string): ToolResponse {
  return { content: [{ type: "text", text }], isError: true };
}
