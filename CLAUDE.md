# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start Vite dev server (http://localhost:5173)
npm run build     # tsc type-check + Vite production build
npm run lint      # ESLint
npm run preview   # serve the production build locally
```

There are no tests in this project.

## Architecture

React 19 + TypeScript + Vite single-page app. No router, no state management library — all state is local React state.

**Entry point**: `src/main.tsx` → `src/App.tsx`

**`App.tsx`** owns two pieces of global state passed as props into `ChatBot`:
- `isDark` — light/dark theme toggle
- `modelId` — currently selected Gemini model (`gemini-3.5-flash` or `gemini-2.5-flash`)

**`src/chatbot/ChatBot.tsx`** is the entire chat feature. It:
- POSTs to `http://localhost:8080/api/v1/vertexai/generateChatStream` with `{ userRequest, modelId, isWebSearch: true }`
- Reads the response as a `ReadableStream`, parsing SSE-style `data: ...` lines and appending each chunk to the last bot message in state
- Renders bot message text as Markdown via `react-markdown`
- Is a floating widget — a toggle button (bottom-right) opens/closes the chat panel

**Backend dependency**: The backend is a separate service (not in this repo) running on `localhost:8080`. It wraps Google Vertex AI / Gemini models. The frontend has no API key or auth — those live in the backend.

## Styling

All styles are in `src/App.css` and inline `style` props. There is no CSS framework installed — the `btn`, `form-control`, and Bootstrap-like class names in `ChatBot.tsx` are vestigial and have no effect without Bootstrap being loaded.
