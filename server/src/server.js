import "./env.js";

import express from "express";
import pino from "pino";
import { runAgent, streamAgent, HumanMessage, AIMessage } from "./agent.js";
import { initKnowledgeBase } from "./tools/knowledgeBase.js";

const log = pino({ base: null, timestamp: pino.stdTimeFunctions.isoTime });
const app = express();
const PORT = process.env.PORT || 3001;

// In-memory session store: sessionId -> message history
const sessions = new Map();

app.use(express.json());

// Log every request
app.use((req, _res, next) => {
  log.info({ method: req.method, path: req.path, level: "info", message: "incoming request" });
  next();
});

// ── Routes ────────────────────────────────────────────────────────────────────

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "message is required" });
  }

  const sessionId = req.headers["x-session-id"] || crypto.randomUUID();
  const history = sessions.get(sessionId) || [];

  log.info({ level: "info", message: "agent invoked", sessionId, userMessage: message });

  try {
    const response = await runAgent(message, history);

    // Append this turn and cap at last 20 messages (10 turns)
    history.push(new HumanMessage(message));
    history.push(new AIMessage(response));
    sessions.set(sessionId, history.slice(-20));

    log.info({ level: "info", message: "agent responded", sessionId, responseLength: response.length });
    res.json({ response, sessionId });
  } catch (err) {
    log.error({ level: "error", message: "agent error", error: err.message, sessionId });
    res.status(500).json({ error: "Agent failed to respond", details: err.message });
  }
});

app.post("/chat/stream", async (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "message is required" });
  }

  const sessionId = req.headers["x-session-id"] || crypto.randomUUID();
  const history = sessions.get(sessionId) || [];

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let fullResponse = "";
  try {
    for await (const token of streamAgent(message, history)) {
      fullResponse += token;
      res.write(`data: ${JSON.stringify({ token })}\n\n`);
    }
    history.push(new HumanMessage(message));
    history.push(new AIMessage(fullResponse));
    sessions.set(sessionId, history.slice(-20));
    res.write(`data: ${JSON.stringify({ done: true, sessionId })}\n\n`);
  } catch (err) {
    log.error({ message: "stream error", error: err.message, sessionId });
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
  } finally {
    res.end();
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────

try {
  await initKnowledgeBase();
  log.info({ level: "info", message: "Knowledge base initialized" });
} catch (err) {
  log.warn({ level: "warn", message: "Knowledge base failed to initialize — KB tool unavailable", error: err.message });
}

app.listen(PORT, () => {
  log.info({ level: "info", message: `Adventure Agent server running on port ${PORT}` });
});
