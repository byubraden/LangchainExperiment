# Adventure Agent — AI Context File

## What This Project Is
A LangChain-powered AI agent with a React chat UI. Users can ask adventure-related questions (hiking, climbing, survival, gear) and the agent routes requests to the right tool automatically.

## Tech Stack
- **Runtime**: Node.js
- **Agent framework**: LangGraph (`@langchain/langgraph` `createReactAgent`)
- **LLM**: Google Gemini (`gemini-2.0-flash`) via `@langchain/google-genai`
- **Embeddings**: Voyage AI (`voyage-3-lite`) via `@langchain/community` `VoyageEmbeddings`
- **Vector store**: `MemoryVectorStore` from `@langchain/classic/vectorstores/memory`
- **Retrieval chains**: `@langchain/classic/chains/retrieval`
- **Web search**: Tavily via `@langchain/tavily` `TavilySearchResults`
- **Schema validation**: `zod` for tool input schemas
- **Backend**: Express.js (`server/`)
- **Frontend**: React + Vite (`client/`)
- **Deployment**: Vercel

## Project Structure
```
/
├── aiDocs/
│   └── context.md          ← you are here
├── client/                 ← React frontend (Vite)
│   └── src/
│       └── App.jsx
├── server/                 ← Express backend + agent
│   ├── src/
│   │   ├── server.js       ← Express entry point
│   │   ├── agent.js        ← LangChain agent setup
│   │   └── tools/
│   │       ├── calculator.js
│   │       ├── webSearch.js
│   │       └── knowledgeBase.js
│   └── knowledge/          ← RAG source documents (markdown)
├── scripts/
│   └── test.sh             ← smoke tests with exit codes
├── AIDocs/
│   ├── context.md          ← you are here
│   └── PRD.md              ← full product spec
├── AI/
│   ├── ROADMAP.md          ← phase overview with links
│   └── roadmap/
│       ├── phase-1-foundation.md
│       ├── phase-2-backend-agent.md
│       ├── phase-3-rag.md
│       ├── phase-4-memory.md
│       ├── phase-5-react-ui.md
│       └── phase-6-deployment.md
├── .env.example            ← env var template (no secrets)
└── .gitignore
```

## Agent Tools
| Tool name | File | What it does |
|-----------|------|-------------|
| `calculator` | `server/src/tools/calculator.js` | Evaluates math expressions safely |
| `web_search` | `server/src/tools/webSearch.js` | Tavily API for current info |
| `knowledge_base` | `server/src/tools/knowledgeBase.js` | Vector search over adventure docs |

## Environment Variables
```
GOOGLE_API_KEY=       # Gemini LLM (free tier at aistudio.google.com)
VOYAGE_API_KEY=       # Voyage AI embeddings
TAVILY_API_KEY=       # Tavily web search
PORT=3001             # Express server port
```

## Key Patterns
- Agent uses `createReactAgent` from `@langchain/langgraph` with tool-calling
- Conversation memory: message history array passed as `chatHistory` per invocation
- Streaming: Express SSE (`text/event-stream`) → React `EventSource`
- Logging: structured JSON logs (one line per event, always include `timestamp`, `level`, `tool`, `message`)
- All tool errors are caught and returned as strings (not thrown) so the agent can recover

## How to Run Locally
```bash
# Install dependencies
npm install
cd client && npm install

# Set up env
cp .env.example .env
# Fill in API keys

# Start backend
cd server && node src/server.js

# Start frontend (separate terminal)
cd client && npm run dev
```

## How to Test
```bash
bash scripts/test.sh
```

## Deployment
- Vercel: `client/` is the static frontend, `server/` is deployed as Node.js serverless functions
- `vercel.json` routes `/api/*` to the backend and `/*` to the frontend
