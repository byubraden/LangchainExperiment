# Phase 4 — Conversation Memory
**Status: NOT STARTED**

## Goal
Make the agent multi-turn aware by maintaining a message history array and passing it to the agent on every invocation. Verify follow-up questions work.

## Checklist
- [ ] Add session-based message history to `server/src/server.js`
- [ ] Update `runAgent()` in `agent.js` to accept and use `chatHistory`
- [ ] Pass `HumanMessage` / `AIMessage` history to `createReactAgent` invocation
- [ ] Test a 3-turn conversation where turn 3 references turn 1
- [ ] Add history to test script

## Implementation Details

### Message History Format
LangGraph's `createReactAgent` accepts a `messages` array. Pass the full history on each call:

```js
import { HumanMessage, AIMessage } from "@langchain/core/messages";

// In agent.js
export async function runAgent(userInput, chatHistory = []) {
  const messages = [
    ...chatHistory,  // prior HumanMessage / AIMessage pairs
    new HumanMessage(userInput),
  ];

  const result = await agent.invoke({ messages });

  // Extract the last AIMessage from result
  const lastMessage = result.messages[result.messages.length - 1];
  return lastMessage.content;
}
```

### Session Storage in server.js
For v1, store history in-memory per session using a simple Map. Sessions are identified by a `sessionId` header or auto-generated UUID.

```js
const sessions = new Map(); // sessionId -> HumanMessage/AIMessage[]

app.post("/chat", async (req, res) => {
  const sessionId = req.headers["x-session-id"] || crypto.randomUUID();
  const { message } = req.body;

  const history = sessions.get(sessionId) || [];
  const response = await runAgent(message, history);

  // Append this turn to history
  history.push(new HumanMessage(message));
  history.push(new AIMessage(response));
  sessions.set(sessionId, history);

  res.json({ response, sessionId });
});
```

### History Limits
Cap history at the last 20 messages (10 turns) to avoid token overflow:
```js
const trimmed = history.slice(-20);
```

### Test Script Addition
```bash
echo "Testing multi-turn memory..."
SESSION_ID=$(uuidgen)
curl -s -X POST $BASE_URL/chat \
  -H "Content-Type: application/json" \
  -H "x-session-id: $SESSION_ID" \
  -d '{"message":"My name is Alex"}' > /dev/null

RESP=$(curl -s -X POST $BASE_URL/chat \
  -H "Content-Type: application/json" \
  -H "x-session-id: $SESSION_ID" \
  -d '{"message":"What is my name?"}')

echo "$RESP" | grep -qi "alex" || { echo "FAIL: memory"; exit 1; }
echo "PASS: memory"
```

## Done When
- Telling the agent "my name is Alex" and then asking "what's my name?" returns "Alex"
- Asking a follow-up like "tell me more about the last topic" works correctly
- History is capped and doesn't cause token limit errors
