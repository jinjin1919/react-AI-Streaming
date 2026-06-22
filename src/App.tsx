import { useState } from "react";
import './App.css';
import ChatBot from "./chatbot/ChatBot";

function App() {
  const [isDark, setIsDark] = useState(false);
  const [modelId, setModelId] = useState("gemini-3.5-flash"); 

  return (
    <div style={{
      minHeight: "100vh",
      width: "100vw",
      backgroundColor: isDark ? "#413f3fff" : "#ffffff",
      transition: "background-color 0.3s ease",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",   
      justifyContent: "center",   
      paddingTop: "0",
    }}>
      <div className="card">
        <div className='zest-prime-title'>AI CHAT STREAMING</div>

        {/* Model info + toggle row */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.5rem",
          marginTop: "0.5rem",
        }}>
          <div style={{ fontFamily: "cursive", color: isDark ? "#f5c842" : "#8B6914", fontSize: "1.1rem", lineHeight: 1.4 }}>
            <div>model</div>
            <div>{modelId}</div>   {/* ← show selected model name */}
          </div>

          {/* Dropdown */}
          <select
            value={modelId}
            onChange={(e) => setModelId(e.target.value)}
            style={{
              fontSize: "0.9rem",
              padding: "6px 10px",
              borderRadius: 8,
              border: "1px solid #ccc",
              backgroundColor: isDark ? "#3a3a3a" : "#fff",
              color: isDark ? "#e0e0e0" : "#000",
              cursor: "pointer",
              fontFamily: "cursive",
            }}
          >
            <option value="gemini-3.5-flash">gemini-3.5-flash</option>
            <option value="gemini-2.5-flash">gemini-2.5-flash</option>
          </select>

          <button
            onClick={() => setIsDark(prev => !prev)}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "2rem",
            }}
          >
            {isDark ? "🌙" : "💡"}
          </button>
        </div>

        <ChatBot isDark={isDark} modelId={modelId} />
      </div>
    </div>
  );
}

export default App;
