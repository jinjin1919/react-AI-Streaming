import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import "./../App.css";

interface Message {
  sender: "user" | "bot";
  text: string;
}

interface ChatBotProps {
  isDark: boolean;
  modelId: string; 
}

const ChatBot: React.FC<ChatBotProps> = ({ isDark, modelId}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([
    { sender: "bot", text: "Hi! How can I help you?" },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const toggleChat = () => setIsOpen(prev => !prev);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { sender: "user", text: input };
    setMessages(prev => [...prev, userMessage, { sender: "bot", text: "" }]);
     setInput("");
    setIsThinking(true); 


    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const requestBody = {
      userRequest: input, 
      modelId: modelId, 
      isWebSearch: true
    }; 
   
    try {
    const response = await fetch("http://localhost:8080/api/v1/vertexai/generateChatStream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok || !response.body) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      setIsThinking(false); 

      const chunk = decoder.decode(value, { stream: true });

      const lines = chunk.split('\n');
      const text = lines
            .filter(line => line.startsWith('data:'))
            .map(line => line.replace(/^data:\s*/, ''))
            .join('\n');

      setMessages(prev => {
      const updated = [...prev];
      const lastIndex = updated.length - 1;
        if (updated[lastIndex].sender === "bot") {
          updated[lastIndex] = {
            ...updated[lastIndex],
            text: updated[lastIndex].text + text,  // append parsed text, not raw chunk
          };
        }
        return updated;
      });
    }
  } catch (err) {
    setIsThinking(false); 
    console.error("Stream error:", err);
  }

    setInput("");
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) eventSourceRef.current.close();
    };
  }, []);

  return (
    <div className="chatbot-container">
      {isOpen && (
        <div
          className="chatbot-box shadow"
          style={{
            width: "calc(100vw - 40px)",   // change from 650
            height: "calc(100vh - 100px)",
            display: "flex",
            flexDirection: "column",
            borderRadius: 12,
            overflow: "hidden",
            backgroundColor: isDark ? "#413f3fff" : "#fff", 
            color: isDark ? "#f0f0f0" : "#252424ff",   
            position: "fixed",
            bottom: 80,
            right: 20,
            zIndex: 9999,
          }}
        >
          <div className="chatbot-header bg-primary text-white p-2 fw-bold">
            <span style={{ fontSize: 25, marginTop: 2 }}>🤖</span>
            SWAT AI Agent
          </div>

          <div
            className="chatbot-messages p-2"
            style={{
              overflowY: "auto",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 8,
              backgroundColor: isDark ? "#1e1e1e" : "#f5f5f5",
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                  backgroundColor: msg.sender === "user"
                                  ? isDark ? "#1a4a7a" : "#70a2d8ff"
                                  : isDark ? "#3a3a3a" : "#d0c1c1ff",
                  padding: 10,
                  borderRadius: 12,
                  maxWidth: "95%",
                  display: "flex",
                  alignItems: msg.sender === "bot" ? "flex-start" : "center",
                  gap: 6,
                  wordBreak: "break-word",
                }}
              >
                {msg.sender === "bot" && msg.text.trim() !== "" && (
                  <span role="img" aria-label="bot" style={{ fontSize: 25, marginTop: 2 }}>
                    🤖
                  </span>
                )}
                <span
                  style={{
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    fontFamily: "Segoe UI, sans-serif",
                    fontSize: 15,
                    lineHeight: 1.5,
                    textAlign: "left",
                    color: isDark ? "#e0e0e0" : "#000000",
                  }}
                >
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </span>
              </div>
            ))}
            {isThinking && (
              <div style={{
                alignSelf: "flex-start",
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                borderRadius: 12,
                backgroundColor: isDark ? "#3a3a3a" : "#d0c1c1ff",
                color: isDark ? "#e0e0e0" : "#555",
                fontSize: 14,
                fontStyle: "italic",
              }}>
                <span>🤖</span>
                <span>Thinking...</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="chatbot-input p-2">
            <div style={{ display: "flex", gap: 8, backgroundColor: isDark ? "#413f3fff" : "#fff" }}>
              <textarea
                className="form-control"
                style={{
                  minHeight: 44,
                  fontSize: "1rem",
                  flex: 1,
                  border: "1px solid #ccc",
                  borderRadius: 4,
                  padding: 8,
                  resize: "none",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type your message"
              />
              <button
                className="btn btn-primary"
                style={{
                  height: 44,
                  fontSize: "1rem",
                  padding: "0 16px",
                  backgroundColor: "blue",
                  fontWeight: "bold",
                  color: "white",
                }}
                onClick={handleSend}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        className="chatbot-toggle-btn rounded-circle"
        onClick={toggleChat}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          width: 50,
          height: 50,
          fontSize: 20,
          zIndex: 9999,
        }}
      >
        💬
      </button>
    </div>
  );
};

export default ChatBot;