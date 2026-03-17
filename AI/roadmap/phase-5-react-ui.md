# Phase 5 — React Chat UI
**Status: NOT STARTED**

## Goal
Build a clean, functional React chat interface using Vite. Connects to the Express backend with streaming responses via SSE. Should feel like a real chat app.

## Checklist
- [ ] Scaffold Vite + React app: `npm create vite@latest client -- --template react`
- [ ] Install client dependencies (`client/package.json`)
- [ ] Build `App.jsx` — main chat layout
- [ ] Build `ChatMessage.jsx` — single message bubble
- [ ] Build `ChatInput.jsx` — text input + send button
- [ ] Connect to `POST /chat` on the Express backend
- [ ] Implement streaming via SSE (`/chat/stream` endpoint)
- [ ] Store and display `sessionId` for conversation continuity
- [ ] Handle loading/error states
- [ ] Basic styling — readable, mobile-friendly

## Directory Structure
```
client/
├── package.json
├── vite.config.js          ← proxy /api → localhost:3001
├── index.html
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── components/
    │   ├── ChatMessage.jsx
    │   └── ChatInput.jsx
    └── App.css
```

## Implementation Details

### vite.config.js — Dev Proxy
Avoids CORS issues during development:
```js
export default {
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        rewrite: path => path.replace(/^\/api/, "")
      }
    }
  }
};
```

### App.jsx — Core State
```jsx
const [messages, setMessages] = useState([]);
const [sessionId, setSessionId] = useState(null);
const [isLoading, setIsLoading] = useState(false);

async function sendMessage(text) {
  setIsLoading(true);
  setMessages(prev => [...prev, { role: "user", content: text }]);

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(sessionId && { "x-session-id": sessionId }),
    },
    body: JSON.stringify({ message: text }),
  });

  const data = await res.json();
  if (!sessionId) setSessionId(data.sessionId);
  setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
  setIsLoading(false);
}
```

### Streaming (SSE) — Optional but Recommended
Add a `/chat/stream` endpoint to the Express server:
```js
app.post("/chat/stream", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");

  const stream = await agent.stream({ messages: [...] });
  for await (const chunk of stream) {
    res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
  }
  res.write("data: [DONE]\n\n");
  res.end();
});
```

On the client, use `EventSource` or `fetch` with `ReadableStream` to consume chunks and append to the current assistant message in real time.

### ChatMessage.jsx
- Two variants: `role="user"` (right-aligned) and `role="assistant"` (left-aligned)
- Show a loading indicator when `isLoading` is true and last message is user
- Render newlines properly (`white-space: pre-wrap`)

### Client Dependencies to Install
```bash
cd client && npm install
# No additional packages needed beyond Vite defaults for basic version
# Optional: react-markdown for rendering markdown in responses
```

## Done When
- `cd client && npm run dev` opens a working chat UI in the browser
- You can have a multi-turn conversation
- The UI shows loading state while waiting for a response
- Works on mobile viewport
