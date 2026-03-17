# Roadmap — Adventure Agent

Each phase has a detailed implementation file in `AI/roadmap/`.

## Phase 1 — Foundation & Infrastructure → [phase-1-foundation.md](roadmap/phase-1-foundation.md)

- [x] PRD, context.md, .gitignore, .env.example
- [x] All dependencies installed and resolving
- [ ] Git repo initialized with first commit

## Phase 2 — Backend Agent Core → [phase-2-backend-agent.md](roadmap/phase-2-backend-agent.md)

- [ ] Express server with `/health` and `/chat`
- [ ] Calculator tool (zod schema)
- [ ] Tavily web search tool
- [ ] LangGraph agent wired up with Claude
- [ ] Structured JSON logging (pino)
- [ ] `scripts/test.sh` passing

## Phase 3 — RAG Knowledge Base → [phase-3-rag.md](roadmap/phase-3-rag.md)

- [ ] 6 adventure documents in `server/knowledge/`
- [ ] Voyage AI embeddings + MemoryVectorStore (@langchain/classic)
- [ ] `knowledge_base` tool with source attribution
- [ ] Knowledge base initialized at server startup

## Phase 4 — Conversation Memory → [phase-4-memory.md](roadmap/phase-4-memory.md)

- [ ] Session-based message history (in-memory Map)
- [ ] Full history passed to agent each turn
- [ ] Multi-turn test passing in test.sh

## Phase 5 — React Chat UI → [phase-5-react-ui.md](roadmap/phase-5-react-ui.md)

- [ ] Vite + React app scaffolded in `client/`
- [ ] Chat interface with message bubbles
- [ ] Connected to backend, streaming responses
- [ ] Loading states and error handling

## Phase 6 — Vercel Deployment → [phase-6-deployment.md](roadmap/phase-6-deployment.md)

- [ ] `vercel.json` configured
- [ ] Serverless adapter for Express
- [ ] Env vars set in Vercel dashboard
- [ ] All tools verified in production

---

## Current Phase: 2
