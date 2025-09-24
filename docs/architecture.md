# Architecture (snapshot after v0.1)

```mermaid
flowchart TD
  UI[client/: UI] --> API[server/: HTTP/API routes]
  API --> SM[server/session: SessionManager]
  SM --> RE[shared/rules: RulesEngine (interface)]
  RE --> RNG[shared/rules: Dice/RNG]
  RE --> DB[(server/db: State Store)]
  SM --> NAR[server/ai: LLM Narration Wrapper]
  NAR --> DB
  DB --> OUT[client/renderers]
