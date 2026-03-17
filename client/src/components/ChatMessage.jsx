import ReactMarkdown from "react-markdown";

export default function ChatMessage({ message }) {
  const isUser = message.role === "user";
  const isLoading = message.role === "loading";

  if (isLoading) {
    return (
      <div className="message-row assistant">
        <div className="avatar assistant-avatar">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <rect x="10" y="14" width="4" height="7" rx="2" fill="currentColor"/>
            <rect x="9" y="5" width="6" height="12" rx="3" fill="currentColor"/>
            <rect x="4" y="8" width="5" height="3" rx="1.5" fill="currentColor"/>
            <rect x="4" y="7" width="2" height="2" rx="1" fill="currentColor"/>
            <rect x="15" y="9" width="5" height="3" rx="1.5" fill="currentColor"/>
            <rect x="18" y="8" width="2" height="2" rx="1" fill="currentColor"/>
            <circle cx="10.5" cy="9" r="1" fill="var(--bg)"/>
            <circle cx="13.5" cy="9" r="1" fill="var(--bg)"/>
            <path d="M10.5 11.5 Q12 12.5 13.5 11.5" stroke="var(--bg)" strokeWidth="0.7" fill="none" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="bubble loading-bubble">
          <span className="dot" />
          <span className="dot" />
          <span className="dot" />
        </div>
      </div>
    );
  }

  return (
    <div className={`message-row ${isUser ? "user" : "assistant"}`}>
      {!isUser && (
        <div className="avatar assistant-avatar">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <rect x="10" y="14" width="4" height="7" rx="2" fill="currentColor"/>
            <rect x="9" y="5" width="6" height="12" rx="3" fill="currentColor"/>
            <rect x="4" y="8" width="5" height="3" rx="1.5" fill="currentColor"/>
            <rect x="4" y="7" width="2" height="2" rx="1" fill="currentColor"/>
            <rect x="15" y="9" width="5" height="3" rx="1.5" fill="currentColor"/>
            <rect x="18" y="8" width="2" height="2" rx="1" fill="currentColor"/>
            <circle cx="10.5" cy="9" r="1" fill="var(--bg)"/>
            <circle cx="13.5" cy="9" r="1" fill="var(--bg)"/>
            <path d="M10.5 11.5 Q12 12.5 13.5 11.5" stroke="var(--bg)" strokeWidth="0.7" fill="none" strokeLinecap="round"/>
          </svg>
        </div>
      )}
      <div className={`bubble ${isUser ? "user-bubble" : "assistant-bubble"}`}>
        <div className="message-text"><ReactMarkdown>{message.content}</ReactMarkdown></div>
      </div>
      {isUser && (
        <div className="avatar user-avatar">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
          </svg>
        </div>
      )}
    </div>
  );
}
