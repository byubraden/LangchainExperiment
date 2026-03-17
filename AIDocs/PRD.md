# Product Requirements Document
## Adventure Agent — AI-Powered Outdoor Knowledge Assistant

### Overview
Adventure Agent is a multi-tool LangChain agent with a React chat UI that helps users with outdoor adventure questions. It can perform calculations, search the web for current information, and retrieve knowledge from a curated adventure knowledge base covering hiking, climbing, survival, and gear.

### Problem It Solves
Outdoor enthusiasts need quick, reliable answers across a wide range of topics — from gear weight calculations to trail conditions to survival techniques. This agent centralizes those answers in a conversational interface, combining real-time web data with a trusted local knowledge base.

### Target User
Students, hikers, climbers, and outdoor enthusiasts who want fast, intelligent answers to adventure-related questions.

---

## Tools

| Tool | Description | API Dependency |
|------|-------------|----------------|
| `calculator` | Evaluates math expressions (pack weight, calories, distances) | None |
| `web_search` | Searches the web for current trail conditions, gear reviews, weather | Tavily API |
| `knowledge_base` | Vector search over curated adventure docs with source attribution | Voyage AI (embeddings) |

## Features

| Feature | Priority | Notes |
|---------|----------|-------|
| Calculator tool | P0 | Pure JS, no external API |
| Web search tool | P0 | Brave Search API |
| RAG knowledge base tool | P0 | Voyage AI embeddings + in-memory vector store |
| React chat UI | P0 | Streaming responses |
| Conversation memory | P0 | Message history passed per-turn |
| Streaming responses | P1 | SSE from Express to React |
| Vercel deployment | P1 | Frontend static + backend serverless |

---

## Architecture

```
React Chat UI (client/)
    ↕ HTTP / SSE
Express API Server (server/)
    └── LangChain Agent
            ├── Calculator Tool
            ├── Brave Web Search Tool
            └── RAG Knowledge Base Tool
                    └── Voyage AI Embeddings → In-Memory Vector Store
```

### Agent
- Framework: `createAgent` from `langchain` (wraps LangGraph ReactAgent)
- Tool schemas: `zod`

### LLM
- Provider: Google Gemini (`gemini-2.0-flash`) — free tier
- SDK: `@langchain/google-genai` `ChatGoogleGenerativeAI`

### Embeddings
- Provider: Voyage AI (`voyage-3-lite` model)
- SDK: `@langchain/community` `VoyageEmbeddings`

### Web Search
- Provider: Tavily
- SDK: `@langchain/tavily` `TavilySearch`

### Vector Store
- `MemoryVectorStore` from `@langchain/classic/vectorstores/memory` (in-memory, no external DB)
- Retrieval chains from `@langchain/classic/chains/retrieval`

### Knowledge Base Documents (≥5 required)
1. `hiking-essentials.md` — The 10 essentials, trail prep, navigation
2. `climbing-safety.md` — Rope systems, anchors, fall factors, communication
3. `survival-basics.md` — Shelter, fire, water purification, signaling
4. `gear-guide.md` — Layering systems, pack weight, materials comparison
5. `nutrition-and-hydration.md` — Calorie needs, electrolytes, water sourcing
6. `leave-no-trace.md` — LNT principles, campsite selection, waste disposal

---

## API Keys Required

| Key | Purpose | Where to Get |
|-----|---------|--------------|
| `GOOGLE_API_KEY` | Gemini LLM | aistudio.google.com (free) |
| `VOYAGE_API_KEY` | Embeddings | dash.voyageai.com (free tier) |
| `TAVILY_API_KEY` | Web search | app.tavily.com (free tier) |

---

## Out of Scope (v1)
- User authentication
- Persistent chat history (database)
- Voice interface
- Mobile app
