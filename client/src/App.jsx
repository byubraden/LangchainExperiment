import { useState, useRef, useEffect } from "react";
import ChatMessage from "./components/ChatMessage";
import ChatInput from "./components/ChatInput";
import "./App.css";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function sendMessage(text) {
    setError(null);
    setIsLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: text }]);

    try {
      const headers = { "Content-Type": "application/json" };
      if (sessionId) headers["x-session-id"] = sessionId;

      const res = await fetch("/api/chat/stream", {
        method: "POST",
        headers,
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server error ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let firstToken = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const json = JSON.parse(line.slice(6));

          if (json.error) throw new Error(json.error);

          if (json.token) {
            if (firstToken) {
              firstToken = false;
              setIsLoading(false);
              setMessages((prev) => [...prev, { role: "assistant", content: json.token }]);
            } else {
              setMessages((prev) => {
                const msgs = [...prev];
                msgs[msgs.length - 1] = {
                  ...msgs[msgs.length - 1],
                  content: msgs[msgs.length - 1].content + json.token,
                };
                return msgs;
              });
            }
          }

          if (json.done && !sessionId) setSessionId(json.sessionId);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  const displayMessages = isLoading
    ? [...messages, { role: "loading" }]
    : messages;

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="brand">
            <svg className="brand-icon" viewBox="0 0 32 32" fill="none">
              <path d="M16 3L3 28h26L16 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M16 3v25M3 28h26" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
              <circle cx="16" cy="14" r="2" fill="currentColor" />
            </svg>
            <span className="brand-name">Adventure Agent</span>
          </div>
          <span className="brand-sub">Moab &amp; Colorado Plateau</span>
        </div>
      </header>

      <main className="chat-area">
        {messages.length === 0 && !isLoading ? (
          <div className="welcome">
            <div className="welcome-icon">
              <svg viewBox="0 0 64 64" fill="none">
                <path d="M32 6L6 58h52L32 6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                <path d="M32 6v52" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
                <path d="M6 58h52" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
                <path d="M19 38l13-20 13 20" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.5" strokeLinejoin="round" />
                <circle cx="32" cy="28" r="3" fill="currentColor" strokeOpacity="0.8" />
              </svg>
            </div>
            <h2 className="welcome-title">Ready to explore?</h2>
            <p className="welcome-body">
              Ask me about hiking Arches &amp; Canyonlands, crack climbing at Indian Creek,
              desert survival, gear for slickrock, or Leave No Trace in canyon country.
            </p>
            <div className="suggestions">
              {[
                "What trails in Canyonlands are best for beginners?",
                "What gear do I need for Indian Creek?",
                "How much water should I carry in summer?",
                "What are the LNT rules for desert camping?",
              ].map((s) => (
                <button key={s} className="suggestion-pill" onClick={() => sendMessage(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="messages-list">
            {displayMessages.map((msg, i) => (
              <ChatMessage key={i} message={msg} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </main>

      {error && (
        <div className="error-banner">
          <span>⚠ {error}</span>
          <button className="error-dismiss" onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  );
}
