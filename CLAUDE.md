# CLAUDE.md — Story Mode Engineering Operating Manual

---

## ⚙️ How to Deploy This File

**This file was written by Claude (claude.ai) and should be added to your project by Claude Code.**

Give Claude Code this prompt:

> "Add the attached CLAUDE.md file to the root of the project, alongside package.json. Do not modify its contents. Confirm when done."

---

## 🧭 The Three-Tool Workflow

This project is managed using three AI tools with distinct roles. Understanding who does what prevents confusion and wasted effort.

| Tool | Role | Best For |
|---|---|---|
| **Claude (claude.ai)** | Strategic partner & prompt author | Planning, audits, architecture decisions, writing prompts for the other tools, reviewing outputs, drafting docs |
| **Cursor (Cohort)** | Senior engineer with full codebase access | Deep code analysis, multi-file refactors, answering "what does this code actually do," debugging |
| **Claude Code** | Executing engineer | Implementing defined tasks, running commands, file creation/editing, committing changes |

### The handoff pattern:
1. **You bring a goal to Claude (me).** We talk through it, make decisions, define the task clearly.
2. **I write the prompt.** Exact instructions, scoped tightly, ready to paste.
3. **You give it to Cursor or Claude Code.** They execute. You paste back any output I need to see.
4. **I review and plan the next step.**

You should never have to translate my outputs into instructions yourself. If I give you something — a document, a plan, a code review — I will also tell you exactly what to do with it and which tool to use.

---

> **For Claude Code:** Read everything below this line at the start of every session before writing any code.
> This is the single source of truth for how we work, what we're building, and how decisions get made.

---

## 1. What We're Building

**Story Mode** is a mobile-first, AI-powered interactive storytelling platform. Users describe a character in plain language, the AI builds a world around them, and the story unfolds through tap-based choices — no dice, no stats, no TTRPG knowledge required.

**Target user:** Someone who has never played a tabletop RPG, may dislike traditional fantasy settings, and wants a creative story experience with zero friction.

**Core loop:**
1. User describes themselves in 2-3 sentences
2. AI generates a world, opening scene, and first quest
3. User taps one of 3-4 choices to advance the story
4. AI responds with narrative + next set of choices
5. Story evolves based on cumulative choices

**What this is NOT:**
- Not a D&D simulator
- Not a free-text chat game
- Not a combat-focused experience
- Not desktop-first

---

## 2. Your Role

You are the engineering team. I am the PM.

**This means:**
- You write and edit code
- I make product decisions
- You flag tradeoffs and options — you do not make product decisions unilaterally
- When something is ambiguous, you stop and ask before proceeding
- You never assume "close enough" — if requirements are unclear, ask

**Before starting any task, confirm:**
1. You have read and understood the task
2. You know which files will be touched
3. You have identified any risks or dependencies
4. If any of the above are unclear, ask before writing a single line of code

---

## 3. Definition of Done

A task is **not done** until all of the following are true:

- [ ] The feature works as described in the task
- [ ] No existing features are broken (manual smoke test: character creation → story → quest update)
- [ ] No TypeScript errors (`tsc --noEmit` passes)
- [ ] No console errors in the browser during normal use
- [ ] Code follows the style guide in Section 6
- [ ] Any new environment variables are added to `.env.example` with a description
- [ ] If a new API route was added, it is documented in `docs/api.md`
- [ ] If a schema change was made, the migration was run and `shared/schema.ts` reflects it
- [ ] You have told me what you changed, what you tested, and what to watch out for

**Never say a task is complete if you haven't manually verified it works.**

---

## 4. How We Communicate

After completing any task, your response must include:

### ✅ What I did
Brief description of changes made, files touched.

### 🧪 How to test it
Exact steps to verify the feature works. Be specific — "go to X, do Y, expect Z."

### ⚠️ Watch out for
Any edge cases, known limitations, or things that could go wrong.

### 📋 What's next
Optional: if there's a logical next step, flag it. Don't start it without being asked.

---

## 5. Version Control Rules

- **Commit after every completed task** — not mid-task, not at end of day
- **Commit message format:** `[type]: short description`
  - Types: `feat`, `fix`, `refactor`, `style`, `chore`, `docs`
  - Examples: `feat: add supabase session persistence`, `fix: correct token cost calculation`
- **Never commit:**
  - `.env` files or secrets
  - `node_modules/`
  - Console.log statements left in production code
  - Commented-out code blocks (delete, don't comment out)
- **Branch strategy:** We work on `main` for now. When we get closer to production, we'll introduce feature branches.

---

## 6. Code Style Guide

### General
- **TypeScript strict mode is on.** No `any` types without a comment explaining why.
- **No implicit returns** in functions that should return a value.
- **Descriptive names.** `generateStoryResponse` not `genResp`. `playerSessionId` not `sid`.
- **Functions do one thing.** If a function is over 40 lines, it probably needs to be split.
- **No magic numbers or strings.** Use named constants. Put them at the top of the file or in `shared/constants.ts`.

### React Components
- Functional components only — no class components
- Props interfaces defined above the component: `interface StoryCardProps { ... }`
- One component per file
- File name matches component name: `StoryCard.tsx` exports `StoryCard`
- Keep components under 200 lines. Extract sub-components if needed.
- No inline styles. Use Tailwind classes only.

### Server / API
- Route handlers are thin — they validate input and call a service function. Business logic lives in service files, not routes.
- All API responses follow this shape:
  ```typescript
  // Success
  { success: true, data: T }

  // Error
  { success: false, error: string, code?: string }
  ```
- All routes validate input with Zod before touching the database or AI.
- Never expose internal error messages to the client. Log them server-side, return a generic message to the client.

### Database
- All DB queries go through the storage layer (`server/storage.ts` or equivalent service files) — never query the DB directly from a route handler.
- Schema changes require a migration. Never hand-edit the database.
- Column names are `snake_case` in Postgres, `camelCase` in TypeScript (Drizzle handles this).

### AI Integration
- System prompts live in their own files or clearly labeled constants — never inline in route handlers.
- All AI calls are wrapped in try/catch with a meaningful fallback.
- Log token usage on every AI call for cost tracking.
- Never send raw user input to the AI without sanitization.

---

## 7. Tech Stack Reference

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React 18 + TypeScript | SPA, view routing via state in App.tsx |
| UI | shadcn/ui + Tailwind CSS | Only import components we actually use |
| Data fetching | TanStack Query (React Query) | All server state |
| Build | Vite | Path aliases: `@` = client/src, `@shared` = shared/ |
| Server | Express.js + Node | Serves API and static files |
| Database | PostgreSQL via Supabase | Drizzle ORM for queries and migrations |
| Auth/Sessions | Supabase anonymous sessions | No accounts required — session per browser |
| AI | OpenRouter → Claude 3.5 Haiku | Via OpenAI SDK |
| Analytics | PostHog | Client-side only |
| Errors | Sentry | Client + server, 10% trace sample |
| Deployment | Render (web service + postgres) | Auto-deploy from main branch |

---

## 8. Brand & UX Rules

These are non-negotiable. Any code that touches the UI must follow these.

### Language
Never use these words in UI copy, component names, variable names, or comments meant to be user-facing:
- Dungeon Master / DM → use **Guide** or **Narrator**
- Campaign → use **Story** or **Adventure**
- Session → use **Chapter**
- Character Sheet → use **Your Character**
- Party / Group → use **Friends**
- Quest → use **Mission** or **Goal** (in UI only — `quest` is fine in code)
- NPC → use **character** or **person in the story**
- Roll / Dice → don't reference dice at all
- Stats / Ability Scores → use **Traits**

### Colors (Pastel Playground palette)
```
Cream background:  #FFF9F0  ← main backgrounds
Soft indigo:       #6C7A89  ← text, headers
Peachy pink:       #FFB6B9  ← primary CTAs
Mint green:        #A8E6CF  ← success states
Lavender:          #C9B6E4  ← secondary actions
```
- No pure black (`#000000`) anywhere
- No dark mode by default
- All backgrounds are cream or white — never gray

### Interaction Model
- Primary interactions are **tap-based choices** — the AI returns 3-4 options, user taps one
- Free text input exists but is secondary
- All tap targets minimum 44x44px
- Mobile-first: design for 375px width, then scale up

---

## 9. Current Milestone

**Milestone 1: Foundation — Real Persistence & Session Isolation**

We are wiring the existing Drizzle schema to a real Supabase Postgres database and giving each browser session its own isolated game state.

### Tasks in scope:
1. Connect Drizzle to Supabase Postgres
2. Replace `MemStorage` with a real DB-backed storage class
3. Add anonymous session ID (stored in localStorage, sent as header)
4. Scope all DB queries to the current session
5. Fix spend tracking to use real token counts from API responses
6. Verify existing smoke test still passes: create character → see story → quest updates

### Out of scope for this milestone:
- Any UI changes
- Auth / user accounts
- RAG or memory improvements
- Brand redesign

---

## 10. Files to Know

| File | What it does |
|---|---|
| `shared/schema.ts` | Database schema (Drizzle + Zod types). Source of truth for data models. |
| `server/storage.ts` | All DB read/write operations. Currently in-memory — being replaced. |
| `server/routes.ts` | All API endpoints. Thin handlers only. |
| `server/aiService.ts` | All AI calls. Prompt construction, response parsing, action execution. |
| `server/spendTracker.ts` | Daily cost limiter. Needs real token counting. |
| `client/src/App.tsx` | View routing and top-level state. Gets complex — be careful here. |
| `client/src/lib/posthog.ts` | Analytics. Don't remove events — add to them. |
| `.env.example` | All required env vars documented here. |

---

## 11. Do Not Touch (Without Explicit Instruction)

- `client/src/lib/posthog.ts` — analytics event taxonomy is intentional, don't reorganize
- `client/src/lib/sentry.ts` / `server/sentry.ts` — error tracking config
- `shared/schema.ts` — only change with a migration plan approved by me first
- `.env` — never commit, never log values, never hardcode
- The `components/ui/` folder — only remove unused components when I specifically ask for a cleanup pass

---

## 12. What We're Deliberately Deleting (Eventually)

These exist in the codebase but are scheduled for removal. Do not build on top of them:

- `components/examples/` — all 10 files, dead storybook code
- `server/worker.ts` — dead Cloudflare Workers stub
- `CombatInterface.tsx` — wrong product paradigm
- `CharacterCreation.tsx`, `CharacterQuestionnaire.tsx`, `AbilityScoreRoller.tsx` — D&D character creation, being replaced
- `CampaignManager.tsx` — broken, being redesigned
- The `users` table and auth stubs in schema/storage — dead code

Do not refactor or improve these files. They will be deleted.

---

## 13. Questions to Ask Before Starting

If any of the following are true, stop and ask before writing code:

- The task touches `shared/schema.ts`
- The task requires a new environment variable
- The task changes how the AI prompt is structured
- The task changes how sessions or identity work
- The task touches more than 5 files
- The task could break the core smoke test
- You're not sure if something is in or out of scope

When in doubt, ask. A 30-second question saves a 30-minute revert.
