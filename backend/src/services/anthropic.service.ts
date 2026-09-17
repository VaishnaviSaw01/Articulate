import Anthropic from "@anthropic-ai/sdk";
import { env } from "../env";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: env.anthropicApiKey });
  }
  return client;
}

type ToolSchema = {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
};

/**
 * Makes a single Claude call that is forced to respond via one tool call, and
 * returns that tool call's parsed input. Used by both scoring prompts so the
 * frontend always receives consistent structured JSON rather than free text.
 */
export async function callClaudeWithTool<T>(params: {
  system: string;
  userMessage: string;
  tool: ToolSchema;
  maxTokens?: number;
}): Promise<T> {
  const { system, userMessage, tool, maxTokens = 2048 } = params;

  const response = await getClient().messages.create({
    model: env.anthropicModel,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: userMessage }],
    tools: [tool as Anthropic.Tool],
    tool_choice: { type: "tool", name: tool.name },
  });

  const toolUse = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
  );

  if (!toolUse) {
    throw new Error(`Claude did not return a tool_use block for tool "${tool.name}"`);
  }

  return toolUse.input as T;
}
