import { useState, useRef, useEffect } from "react";

export default function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function submit() {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleInput(e) {
    setText(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
    }
  }

  return (
    <div className="input-bar">
      <div className="input-wrapper">
        <textarea
          ref={textareaRef}
          className="chat-textarea"
          value={text}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Ask about trails, gear, climbing, survival…"
          disabled={disabled}
          rows={1}
        />
        <button
          className={`send-btn ${disabled || !text.trim() ? "send-btn--disabled" : ""}`}
          onClick={submit}
          disabled={disabled || !text.trim()}
          aria-label="Send message"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
      <p className="input-hint">Shift+Enter for new line</p>
    </div>
  );
}
