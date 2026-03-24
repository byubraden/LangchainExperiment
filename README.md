# Adventure Agent

A multi-tool AI chatbot agent built with LangChain.js that helps with outdoor adventure questions — hiking, climbing, survival, and gear. Uses the ReAct pattern to decide when to calculate, search the web, or look up from a local knowledge base.

Live demo: [adventure-agent.vercel.app](https://adventure-agent.vercel.app)

---

## What It Does

- **Calculator** — evaluates math expressions (pack weight, calorie totals, distances)
- **Web search** — searches the web for current trail conditions, gear reviews, weather (Tavily)
- **Knowledge base** — vector search over 7 curated adventure documents with source attribution (Voyage AI + MemoryVectorStore)
- **Conversation memory** — multi-turn context so follow-up questions work
- **Streaming responses** — tokens stream in real time via SSE
- **React chat UI** — clean dark-themed interface

---

## Stack

| Layer | Tech |
|---|---|
| LLM | Anthropic Claude (`claude-haiku-4-5`) |
| Agent | `createAgent` from `langchain` (LangGraph ReAct) |
| Embeddings | Voyage AI (`voyage-3-lite`) |
| Vector store | `MemoryVectorStore` (in-memory) |
| Web search | Tavily (`@langchain/tavily`) |
| Backend | Node.js + Express |
| Frontend | React + Vite |
| Deployment | Vercel (serverless + static) |

---

## How to Run Locally

### 1. Clone the repo

```bash
git clone https://github.com/byubraden/LangchainExperiment.git
cd LangchainExperiment
```

### 2. Set up environment variables

```bash
cp server/.env.example server/.env
```

Edit `server/.env` and add your API keys:

```
ANTHROPIC_API_KEY=your_key
VOYAGE_API_KEY=your_key
TAVILY_API_KEY=your_key
```

### 3. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 4. Start the backend

```bash
cd server && npm run dev
```

### 5. Start the frontend

```bash
cd client && npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Knowledge Base

Documents are in `server/knowledge/`. The vector embeddings are pre-computed and stored in `server/knowledge/embeddings.json` — no API call needed at startup.

If you add new `.md` files, regenerate embeddings:

```bash
node scripts/generate-embeddings.js
```

Then commit the updated `embeddings.json`.

---

## Project Structure

```
├── client/          # React + Vite frontend
├── server/
│   ├── knowledge/   # Markdown docs + pre-computed embeddings
│   └── src/
│       ├── agent.js        # LangChain agent setup
│       ├── app.js          # Express routes
│       ├── server.js       # Local dev entry point
│       └── tools/          # Calculator, web search, knowledge base
├── api/
│   └── index.js    # Vercel serverless entry point
├── AIDocs/         # PRD and context docs
├── AI/             # Roadmap
└── scripts/        # generate-embeddings.js
```

---

## API Keys

| Key | Purpose | Where to Get |
|---|---|---|
| `ANTHROPIC_API_KEY` | LLM | console.anthropic.com |
| `VOYAGE_API_KEY` | Embeddings | dash.voyageai.com |
| `TAVILY_API_KEY` | Web search | app.tavily.com |