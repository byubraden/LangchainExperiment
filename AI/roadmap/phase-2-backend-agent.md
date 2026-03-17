# Phase 2 — Backend Agent Core
**Status: NOT STARTED**

## Goal
Build a working Express server with a LangGraph agent wired up to the Calculator and Tavily web search tools. Agent should be testable from the terminal by end of phase.

## Checklist
- [ ] Create `server/` directory structure
- [ ] Set up `server/package.json` with `express`, `dotenv`, `pino`
- [ ] Build `server/src/server.js` — Express entry point
- [ ] Implement `server/src/tools/calculator.js`
- [ ] Implement `server/src/tools/webSearch.js`
- [ ] Build `server/src/agent.js` — LangGraph agent with both tools
- [ ] Add structured logging throughout
- [ ] Add `/health` and `/chat` routes to server
- [ ] Write `scripts/test.sh` — smoke tests with exit codes
- [ ] Verify agent works end-to-end from terminal

## Directory Structure to Create
```
server/
├── package.json
└── src/
    ├── server.js
    ├── agent.js
    └── tools/
        ├── calculator.js
        └── webSearch.js
scripts/
└── test.sh
```

## Implementation Details

### server/src/tools/calculator.js
- Use `zod` to define input schema: `{ expression: z.string() }`
- Use `Function()` constructor or a safe math parser (avoid `eval` with user input directly)
- Catch all errors and return as strings so the agent can recover
- Tool name: `"calculator"`, description should mention pack weight, distances, calories

```js
// Pattern
import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const calculatorTool = tool(
  async ({ expression }) => { /* ... */ },
  {
    name: "calculator",
    description: "...",
    schema: z.object({ expression: z.string() })
  }
);
```

### server/src/tools/webSearch.js
- Import `TavilySearchResults` from `@langchain/tavily`
- Set `maxResults: 5`
- API key from `process.env.TAVILY_API_KEY`
- Wrap in a try/catch, return error string on failure

```js
import { TavilySearch } from "@langchain/tavily";

export const webSearchTool = new TavilySearch({
  maxResults: 5,
  apiKey: process.env.TAVILY_API_KEY,
});
```

### server/src/agent.js
- Import `createAgent` from `langchain` (non-deprecated; uses `model` not `llm`)
- Import `ChatGoogleGenerativeAI` from `@langchain/google-genai`
- Model: `gemini-2.0-flash` (free tier)
- Pass `[calculatorTool, webSearchTool]` as tools (knowledge base added in Phase 3)
- Build agent lazily inside `getAgent()` so env vars are set before tool construction
- Export a `runAgent(input, chatHistory)` function
- `chatHistory` defaults to `[]` for now (memory wired in Phase 4)

### server/src/server.js
- `GET /health` → `{ status: "ok", timestamp }`
- `POST /chat` → `{ message: string }` → runs agent → returns `{ response: string }`
- Load `.env` with `dotenv` at top of file
- Use `pino` for structured JSON logging on every request

### Structured Logging Pattern
Every log line must be valid JSON with at minimum:
```json
{ "timestamp": "...", "level": "info", "message": "...", "tool": "calculator" }
```

### scripts/test.sh
```bash
#!/bin/bash
set -e
BASE_URL="http://localhost:3001"

echo "Testing /health..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/health)
[ "$STATUS" = "200" ] || { echo "FAIL: /health returned $STATUS"; exit 1; }
echo "PASS: /health"

echo "Testing calculator..."
RESP=$(curl -s -X POST $BASE_URL/chat -H "Content-Type: application/json" -d '{"message":"what is 42 * 7?"}')
echo "$RESP" | grep -q "294" || { echo "FAIL: calculator"; exit 1; }
echo "PASS: calculator"

echo "All tests passed."
exit 0
```

## Done When
- `node server/src/server.js` starts without errors
- `curl localhost:3001/health` returns 200
- Asking "what is 15 * 24?" returns 360
- Asking "what is the weather like on Mt. Rainier?" triggers a Tavily search and returns a real answer
- `bash scripts/test.sh` exits 0
