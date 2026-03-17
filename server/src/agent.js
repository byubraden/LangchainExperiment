import "./env.js";
import { createAgent } from "langchain";
import { ChatAnthropic } from "@langchain/anthropic";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { calculatorTool } from "./tools/calculator.js";
import { getWebSearchTool } from "./tools/webSearch.js";
import { knowledgeBaseTool } from "./tools/knowledgeBase.js";

const model = new ChatAnthropic({
  model: "claude-haiku-4-5-20251001",
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Build agent lazily so tools can access env vars after dotenv loads
const SYSTEM_PROMPT = `You are an Adventure Agent specializing in Moab, Utah and the Colorado Plateau.

You have access to a personal knowledge base that includes firsthand hike reviews written by the user — trails they have personally completed, including their own tips, highlights, and observations. When asked about hikes the user has done, always search the knowledge_base tool first.

Always use the knowledge_base tool before web search for questions about:
- Hikes, trails, or outdoor experiences in the Moab area
- Gear, survival, nutrition, or Leave No Trace in canyon country

Use web search for current conditions, recent news, or anything not covered in the knowledge base.`;

let _agent = null;
function getAgent() {
  if (!_agent) {
    _agent = createAgent({
      model,
      tools: [calculatorTool, getWebSearchTool(), knowledgeBaseTool],
      systemPrompt: SYSTEM_PROMPT,
    });
  }
  return _agent;
}

/**
 * Run the agent with an optional chat history for multi-turn conversations.
 * @param {string} input - The user's message
 * @param {Array<HumanMessage|AIMessage>} chatHistory - Prior conversation turns
 * @returns {Promise<string>} - The agent's text response
 */
export async function runAgent(input, chatHistory = []) {
  const messages = [...chatHistory, new HumanMessage(input)];
  const result = await getAgent().invoke({ messages });
  const last = result.messages[result.messages.length - 1];
  return typeof last.content === "string"
    ? last.content
    : last.content.map((c) => (typeof c === "string" ? c : c.text ?? "")).join("");
}

/**
 * Stream text tokens from the agent as an async generator.
 * Skips tool-call chunks; only yields final text tokens.
 */
export async function* streamAgent(input, chatHistory = []) {
  const messages = [...chatHistory, new HumanMessage(input)];
  const eventStream = getAgent().streamEvents({ messages }, { version: "v2" });

  for await (const event of eventStream) {
    if (event.event !== "on_chat_model_stream") continue;
    const chunk = event.data?.chunk;
    if (chunk?.tool_call_chunks?.length) continue; // skip tool-call tokens

    const content = chunk?.content;
    if (typeof content === "string" && content) {
      yield content;
    } else if (Array.isArray(content)) {
      for (const c of content) {
        const text = typeof c === "string" ? c : (c.type === "text" ? c.text : "");
        if (text) yield text;
      }
    }
  }
}

export { HumanMessage, AIMessage };
