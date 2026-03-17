# Phase 6 — Vercel Deployment
**Status: NOT STARTED**

## Goal
Deploy the full app to Vercel: React frontend as a static site, Express backend as a Node.js serverless function. All tools work in production.

## Checklist
- [ ] Create `vercel.json` at project root
- [ ] Adapt Express server for Vercel serverless (export handler)
- [ ] Set environment variables in Vercel dashboard
- [ ] Run `vercel --prod` and verify deployment
- [ ] Test all 3 tools (calculator, web search, knowledge base) in production
- [ ] Test multi-turn memory in production
- [ ] Update `AIDocs/context.md` with production URL

## Vercel Project Structure
Vercel needs:
- Static frontend build output from `client/dist/`
- API routes from `api/` directory (serverless functions)

```
/
├── api/
│   └── chat.js        ← Express handler adapted for Vercel
├── client/            ← React app (built to client/dist/)
└── vercel.json        ← Routing config
```

## vercel.json
```json
{
  "version": 2,
  "builds": [
    { "src": "client/dist/**", "use": "@vercel/static" },
    { "src": "api/**/*.js", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/$1" },
    { "src": "/(.*)", "dest": "/client/dist/$1" }
  ]
}
```

## api/chat.js — Serverless Adapter
Vercel serverless functions export a default handler instead of calling `app.listen()`:

```js
import { runAgent } from "../server/src/agent.js";
import { initKnowledgeBase } from "../server/src/tools/knowledgeBase.js";

// Initialize once per cold start
let initialized = false;
async function ensureInit() {
  if (!initialized) {
    await initKnowledgeBase();
    initialized = true;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  await ensureInit();
  const { message } = req.body;
  // session handling, run agent, return response
}
```

## Environment Variables to Set in Vercel Dashboard
Go to: Vercel Project → Settings → Environment Variables

| Variable | Value |
|----------|-------|
| `ANTHROPIC_API_KEY` | Your Anthropic key |
| `VOYAGE_API_KEY` | Your Voyage AI key |
| `TAVILY_API_KEY` | Your Tavily key |

**Never put these in code or vercel.json.**

## Build Command Setup
In Vercel dashboard or `vercel.json`:
- **Build command**: `cd client && npm install && npm run build`
- **Output directory**: `client/dist`
- **Install command**: `npm install`

## Cold Start Note
Vercel serverless functions have cold starts. The knowledge base `initKnowledgeBase()` runs on first request after cold start (~2-3s). This is acceptable for a class project. In production you'd use a persistent server or pre-warm the function.

## Done When
- Production URL loads the React chat UI
- All 3 tools work in production
- Multi-turn memory works (within a session — resets on page refresh, which is expected)
- No API keys are visible in client-side code or network requests
