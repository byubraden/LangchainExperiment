# Adventure Agent — AI Context File

## What This Project Is
A LangChain-powered AI agent with a React chat UI. Users can ask adventure-related questions (hiking, climbing, survival, gear) and the agent routes requests to the right tool automatically.

## Tech Stack
- **Runtime**: Node.js
- **Agent framework**: `createAgent` from `langchain` (wraps LangGraph ReAct agent)
- **LLM**: Anthropic Claude (`claude-haiku-4-5-20251001`) via `@langchain/anthropic`
- **Embeddings**: Voyage AI (`voyage-3-lite`) via `@langchain/community` `VoyageEmbeddings`
- **Vector store**: `MemoryVectorStore` from `@langchain/classic/vectorstores/memory`
- **Web search**: Tavily via `@langchain/tavily` `TavilySearch`
- **Schema validation**: `zod` for tool input schemas
- **Backend**: Express.js (`server/`)
- **Frontend**: React + Vite (`client/`)
- **Logging**: `pino` structured JSON logging
- **Deployment**: Vercel (static frontend + serverless backend)

## Project Structure
```
/
├── api/
│   └── index.js            ← Vercel serverless entry point (exports Express app)
├── client/                 ← React + Vite frontend
│   └── src/
│       ├── App.jsx          ← main chat UI + streaming logic
│       └── components/
│           └── ChatMessage.jsx ← message bubbles with markdown rendering
├── server/                 ← Express backend + agent
│   ├── src/
│   │   ├── server.js        ← local dev entry point (calls app.listen)
│   │   ├── app.js           ← Express routes + initApp() export
│   │   ├── agent.js         ← LangChain agent setup (lazy singleton)
│   │   └── tools/
│   │       ├── calculator.js
│   │       ├── webSearch.js
│   │       └── knowledgeBase.js
│   └── knowledge/           ← RAG source documents (markdown)
│       └── embeddings.json  ← pre-computed Voyage embeddings (committed to repo)
├── scripts/
│   ├── test.sh              ← smoke tests
│   └── generate-embeddings.js ← run locally to recompute embeddings.json
├── AIDocs/
│   ├── context.md           ← you are here
│   └── PRD.md               ← full product spec
├── AI/
│   ├── ROADMAP.md           ← phase overview with checkboxes
│   └── roadmap/             ← per-phase implementation guides
├── vercel.json              ← Vercel routing config
├── .env.example             ← env var template (no secrets)
└── .gitignore
```

## Agent Tools
| Tool name | File | What it does |
|-----------|------|-------------|
| `calculator` | `server/src/tools/calculator.js` | Evaluates math expressions safely |
| `web_search` | `server/src/tools/webSearch.js` | Tavily API for current info |
| `knowledge_base` | `server/src/tools/knowledgeBase.js` | Vector search over 7 adventure docs with source attribution |

## Knowledge Base Documents
1. `hiking-essentials.md` — The 10 essentials, trail prep, navigation
2. `climbing-safety.md` — Rope systems, anchors, fall factors
3. `survival-basics.md` — Shelter, fire, water purification, signaling
4. `gear-guide.md` — Layering systems, pack weight, materials
5. `nutrition-hydration.md` — Calorie needs, electrolytes, water sourcing
6. `leave-no-trace.md` — LNT principles, waste disposal
7. `personal-hikes.md` — User's firsthand hike reviews (Moab area)

Embeddings are pre-computed and stored in `knowledge/embeddings.json`. Startup loads from this file — no Voyage API call needed. To add new docs, run `node scripts/generate-embeddings.js` and commit the updated file.

## Environment Variables
```
ANTHROPIC_API_KEY=    # Claude LLM (console.anthropic.com)
VOYAGE_API_KEY=       # Voyage AI embeddings (dash.voyageai.com)
TAVILY_API_KEY=       # Tavily web search (app.tavily.com)
PORT=3001             # Express server port (local dev only)
```

## Key Patterns
- Agent uses `createAgent` from `langchain` with `systemPrompt` for tool guidance
- Conversation memory: `HumanMessage`/`AIMessage` history array passed per invocation, capped at 20 messages
- Streaming: Express SSE (`text/event-stream`) → React `fetch` with `ReadableStream`; filters `on_chat_model_stream` events, skips tool call chunks
- Logging: `pino` structured JSON (method, path, sessionId, tool, message per event)
- KB fallback: if Voyage query embedding fails (rate limit), falls back to keyword search over raw docs

## How to Run Locally
```bash
# Install dependencies
cd server && npm install
cd ../client && npm install

# Set up env
cp server/.env.example server/.env
# Fill in API keys

# Start backend (terminal 1)
cd server && npm run dev

# Start frontend (terminal 2)
cd client && npm run dev
```

Open http://localhost:5173

## How to Test
```bash
bash scripts/test.sh
```

## Deployment
- `api/index.js` exports the Express app — Vercel treats it as a serverless function
- `vercel.json` routes `/api/*` to `api/index.js` and serves `client/dist` as static
- Env vars must be set in Vercel dashboard (Settings → Environment Variables)
- Embeddings are pre-computed in `knowledge/embeddings.json` so no Voyage calls on cold start