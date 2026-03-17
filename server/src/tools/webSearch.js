import { TavilySearch } from "@langchain/tavily";

// Lazily initialized so dotenv can load before the constructor runs
let _tool = null;

export function getWebSearchTool() {
  if (!_tool) {
    _tool = new TavilySearch({
      maxResults: 5,
      apiKey: process.env.TAVILY_API_KEY,
    });
    _tool.name = "web_search";
    _tool.description =
      "Searches the web for current information about trail conditions, gear reviews, weather forecasts, recent news, or anything that requires up-to-date data. Use this when the knowledge base doesn't have the answer or when current information is needed.";
  }
  return _tool;
}
