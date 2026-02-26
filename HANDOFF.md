# HANDOFF.md — Session Context for Future David & Claude

---

## Session Date & Summary

**Date:** February 26, 2026

**What we set out to do:**
1. Fix the spend tracker to use real token counts from the OpenRouter API (it was estimating incorrectly)
2. Add an admin dashboard to monitor AI costs
3. Wire session IDs into the frontend so API calls stop failing with "Missing x-session-id header"
4. Fix the chat input visibility bug (input was pushed below viewport and hidden behind nav bar)
5. Update CLAUDE.md to reflect Milestone 2 and document completed Milestone 1

**What we actually accomplished:**
All of the above, plus discovered and fixed a critical bug where the fallback cost calculation was showing $4.80 per request instead of $0.0032. The fix involved correcting the token split assumption (1500 input + 500 output instead of 1000+1000) and ensuring the `calculateCost()` function was actually called.

---

## What Was Just Built

### Files Modified This Session:

#### `server/spendTracker.ts`
- **Added `TokenUsage` interface** for type-safe token data from OpenRouter
- **Added `SessionSpend` interface** and `sessionSpends: Map<string, SessionSpend>` to track per-session costs
- **Added `AllTimeStats` interface** for cumulative statistics
- **Updated `trackRequest(sessionId?, usage?)`** to accept optional session ID and actual token usage from API
- **Added `getAdminStats()` method** returning today's spend, all-time stats, daily limit, remaining budget, and average cost per request
- **Added `getSessionStats()` method** returning array of per-session spend data
- **Fixed fallback cost calculation bug**: Changed from `1000 * INPUT_COST_PER_1K` (which multiplied wrongly) to calling `this.calculateCost({ promptTokens: 1500, completionTokens: 500, totalTokens: 2000 })` properly
- **Pricing constants**: $0.0008/1K input tokens, $0.004/1K output tokens (Claude 3.5 Haiku via OpenRouter)

#### `server/aiService.ts`
- **Added `TokenUsage` to `AIResponse` interface** so routes can pass actual usage to spendTracker
- **Capture token usage from API**: Extract `prompt_tokens`, `completion_tokens`, `total_tokens` from `response.usage`
- **Added explicit debug logging**: `console.log('[AI Service] Raw response.usage from OpenRouter:', JSON.stringify(response.usage))`
- **Added warning if usage missing**: Logs a warning when OpenRouter doesn't return usage data so we know fallback is being used

#### `server/routes.ts`
- **Added admin auth middleware**: `adminAuth` checks `x-admin-key` header against `ADMIN_KEY` env var
- **Added `GET /api/admin/spend`**: Returns `spendTracker.getAdminStats()` (protected by admin key)
- **Added `GET /api/admin/sessions`**: Returns `spendTracker.getSessionStats()` (protected by admin key)
- **Updated all `trackRequest()` calls** to pass `sessionId` and `aiResponse.tokenUsage`

#### `client/src/main.tsx`
- **Session ID generation on app init**: If `localStorage.getItem('sessionId')` is null, generates a new UUID with `crypto.randomUUID()` and stores it

#### `client/src/lib/queryClient.ts`
- **Added `getSessionId()` helper**: Returns `localStorage.getItem('sessionId') || ''`
- **Added `x-session-id` header to `apiRequest()`**: All mutations now include the session header
- **Added `x-session-id` header to `getQueryFn()`**: All queries now include the session header

#### `client/src/App.tsx`
- **Fixed chat overflow bug**: Changed `<main>` from always `overflow-auto` to conditional: `overflow-hidden` when `activeTab === 'chat'`, `overflow-auto` otherwise
- **Added `/admin` route check**: When `window.location.pathname === '/admin'`, renders `AdminDashboard` instead of normal app

#### `client/src/components/ChatInterface.tsx`
- **Added `pb-20` to outer div**: Bottom padding so chat input sits above the mobile nav bar (which is ~64px tall)

#### `client/src/components/AdminDashboard.tsx` (NEW FILE)
- **Admin login prompt**: Shows password input that checks against localStorage or prompts for admin key
- **Spend metrics cards**: Today's cost, request count, token usage, remaining budget, percentage of limit
- **Session breakdown table**: Shows all sessions with their request counts, costs, and token totals
- **Refresh button**: Re-fetches data from admin endpoints
- **Styling**: Uses shadcn/ui Card, Button, Input components with the project's cream/pastel theme

#### `.env.example`
- **Added `ADMIN_KEY`** documentation: "Admin Dashboard - secret key for accessing /api/admin/* endpoints"

#### `CLAUDE.md`
- **Section 9**: Replaced Milestone 1 content with Milestone 2 (AI Memory & Context — Rolling Story Summary)
- **Added Section 9a**: "Completed Milestones" documenting what Milestone 1 built
- **Section 10**: Added new files (`db.ts`, `dbStorage.ts`, `AdminDashboard.tsx`, updated descriptions)
- **Section 12**: Removed files that were deleted, added note about `MemStorage` being kept as backup

---

## Current State of the App

### What works right now (`npm run dev`):

1. **Character creation flow**: User can describe a character, AI generates a world and opening scene
2. **Chat/story interface**: User can send messages, AI responds with narrative and choices
3. **Quests tab**: Shows active/completed quests with progress
4. **Inventory tab**: Shows items the character has collected
5. **Session persistence**: All data survives server restarts (stored in Supabase PostgreSQL)
6. **Session isolation**: Each browser gets its own independent game state via `x-session-id` header
7. **Admin dashboard**: Visit `/admin`, enter the admin key, see real-time spend metrics

### Smoke test checklist:
1. Open http://localhost:3000
2. Create a new character (or see existing one if session has data)
3. Go to Story tab, send a message
4. AI should respond (may use fallback if no OPENROUTER_API_KEY)
5. Check Quests tab — should show at least the starting quest
6. Visit http://localhost:3000/admin — enter admin key — see spend metrics

### What's still dark/broken/placeholder:

1. **OPENROUTER_API_KEY not set in .env**: Currently falling back to static responses. Real AI calls work when the key is set.
2. **Combat system**: `CombatInterface.tsx` exists but is deprecated — product direction moved away from combat
3. **Old character creation flows**: `CharacterCreation.tsx`, `CharacterQuestionnaire.tsx`, `AbilityScoreRoller.tsx` are dead code awaiting deletion
4. **CampaignManager.tsx**: Broken, being redesigned
5. **Duplicate analytics key warning**: `aiResponseReceived` appears twice in `posthog.ts` — cosmetic warning, doesn't affect function
6. **Brand colors not fully applied**: UI uses default shadcn theme in many places, not the Pastel Playground palette from CLAUDE.md

---

## Exact State of Every Milestone

| Milestone | Status | Description |
|-----------|--------|-------------|
| 0. Local Dev | ✅ Done | Repo runs locally with npm run dev |
| 1. Foundation | ✅ Done | Real DB persistence, session isolation |
| 2. AI Memory | 🔜 Next | Rolling story summary |
| 3. Story Polish | Not started | Better prompts, choice generation |
| 4. Onboarding | Not started | Simplified character creation |
| 5. Production | Not started | Error handling, monitoring, deploy |

### Milestone 0: Local Development ✅
Fully complete. `npm install && npm run dev` starts the app. PostgreSQL via Supabase, Drizzle ORM migrations work.

### Milestone 1: Foundation — Real Persistence & Session Isolation ✅
**Fully complete as of this session.**

What was built:
- `server/db.ts`: Database connection pool with `testConnection()` health check
- `server/dbStorage.ts`: Full `IStorage` implementation with session scoping on all queries
- Session ID generation in `main.tsx`, header injection in `queryClient.ts`
- All 5 main tables (`characters`, `quests`, `items`, `messages`, `gameState`) have `sessionId` column
- Real token cost tracking in `spendTracker.ts` with actual API usage data
- Admin dashboard at `/admin` with spend metrics and session breakdown

### Milestone 2: AI Memory & Context — Rolling Story Summary 🔜
**Not started. This is the next milestone.**

Goal: The AI should remember the full narrative context of the adventure, not just the last 5 messages.

Tasks to do:
1. Design a story summary schema
2. Create summarization service that condenses old messages
3. Update `aiService.ts` to include rolling summary in system prompt
4. Implement automatic summarization triggers
5. Test AI can reference early events

### Milestone 3: Story Polish
**Not started.** Better AI prompts, improved choice generation, narrative quality.

### Milestone 4: Onboarding
**Not started.** Simplified character creation, remove D&D complexity.

### Milestone 5: Production Readiness
**Not started.** Error handling, monitoring dashboards, production deployment.

---

## The Next Thing To Do

**Ready-to-paste Claude Code prompt for the next session:**

```
Read HANDOFF.md and CLAUDE.md in full before doing anything.

We're starting Milestone 2: AI Memory & Context — Rolling Story Summary.

The AI currently only sees the last 5 messages. Users report it "forgets" things from earlier in the story. We need a rolling summary system.

Step 1: Design the schema. I want you to propose a schema for story summaries. Consider:
- Where should summaries be stored? (New table? Field on existing table?)
- What fields do we need? (summary text, message range covered, timestamp, sessionId)
- How do we know when to generate a new summary?
- How does the AI service retrieve and use the summary?

Do NOT write any code yet. Just propose the design and wait for my approval. Show me:
1. The proposed table schema
2. When summaries get generated (trigger conditions)
3. How the summary gets injected into the AI prompt
4. Any edge cases or questions you have
```

---

## Loose Ends & Watch Outs

### Half-done:
- **Real token tracking only works when OPENROUTER_API_KEY is set**. Without it, the system falls back to static responses and uses the fallback estimate (1500+500 tokens = $0.0032). The logging added this session will show whether OpenRouter returns usage data.

### Known bugs:
- **Duplicate `aiResponseReceived` key in posthog.ts**: Vite shows a warning on startup. Cosmetic issue, doesn't break anything, but should be cleaned up eventually.
- **Browserslist warning**: "browsers data is 16 months old" — run `npx update-browserslist-db@latest` to fix (low priority)

### Things that could break:
- **If `ADMIN_KEY` is not set**, the admin endpoints will reject all requests with 401. This is intentional security, but could confuse someone expecting the dashboard to work.
- **If session ID is cleared from localStorage**, user loses access to their game data (it still exists in DB, but they can't reach it). No recovery mechanism exists yet.

### Decisions deferred:
- **How to handle session recovery**: If a user clears localStorage, should they be able to recover their session? Deferred to a future milestone.
- **Multi-device sync**: Out of scope for now. Each device = separate session.
- **Brand redesign implementation**: The Pastel Playground palette is defined in CLAUDE.md but not fully applied to the UI. Deferred.

---

## Decisions Made This Session

### 1. Admin authentication via header, not session
**Options considered:**
- Session-based auth with login page
- Simple header-based auth with static key
- No auth (public admin)

**Chosen:** Header-based auth with `x-admin-key` header checked against `ADMIN_KEY` env var.

**Why:** Simplest solution for an internal tool. No user accounts needed. The key can be shared with team members who need access. Easy to rotate by changing the env var.

### 2. Session ID generation in localStorage
**Options considered:**
- Server-generated session IDs (returned on first request)
- Supabase anonymous auth
- Client-generated UUIDs in localStorage

**Chosen:** Client-generated UUIDs in localStorage.

**Why:** Zero server round-trips, works offline, survives page refreshes. Supabase anon auth was considered but adds complexity we don't need yet. We can migrate to proper auth later if needed.

### 3. Fallback token estimate of 1500+500
**Options considered:**
- 1000 input + 1000 output (50/50 split)
- 1500 input + 500 output (75/25 split based on typical chat patterns)
- No fallback (fail if no usage data)

**Chosen:** 1500+500 split.

**Why:** More realistic for a chat application where the system prompt and context are larger than the AI's response. The 50/50 split was overcharging on output costs.

### 4. Chat input padding vs repositioning
**Options considered:**
- Add `pb-20` padding to push content above nav
- Reposition nav bar to be part of the layout flow
- Make chat input fixed-position independent of scroll area

**Chosen:** Simple `pb-20` padding on the chat container.

**Why:** Least invasive fix. The nav bar is already fixed at bottom, adding padding prevents overlap. More complex solutions could break other tabs.

---

## Environment & Infra State

### `.env` variables (names only):
```
OPENROUTER_API_KEY    # Required for real AI responses
DATABASE_URL          # Supabase PostgreSQL connection string
PORT                  # Server port (default 5000, dev uses 3000)
NODE_ENV              # development | production
SENTRY_DSN            # Optional error tracking
ADMIN_KEY             # Required for /api/admin/* endpoints
```

### Render deployment:
- **Web service**: Auto-deploys from `main` branch
- **Database**: Using Supabase PostgreSQL (not Render's DB)
- **Build command**: `npm run build`
- **Start command**: `npm start`

### Supabase state:
- **Tables**: `characters`, `quests`, `items`, `messages`, `game_state`, plus some unused tables (`users`, `enemies`, `campaigns`)
- **All active tables have `session_id` column** for isolation
- **Connection**: Via `DATABASE_URL` env var using `postgres` package + Drizzle ORM

### Admin dashboard shows:
- Today's date and daily spend
- Total cost, request count, prompt tokens, completion tokens
- Daily limit ($10), remaining budget, percentage used
- Per-session breakdown table (session ID, requests, cost, tokens)

---

## How To Resume

### Before writing any code:

1. **Read context files:**
   ```bash
   # In the project directory
   cat HANDOFF.md   # This file — session context
   cat CLAUDE.md    # Engineering operating manual
   ```

2. **Start the dev server:**
   ```bash
   cd /Users/davidsteinbroner/Projects/Active\ Development/story-mode
   npm run dev
   ```

3. **Verify the app works:**
   - Open http://localhost:3000
   - Confirm character loads (or create one)
   - Send a test message in the Story tab
   - Check http://localhost:3000/admin (enter admin key)

4. **Check git status:**
   ```bash
   git status        # Should be clean
   git log --oneline -5  # See recent commits
   ```

5. **Verify environment:**
   - Check `.env` has `DATABASE_URL` set (app won't start without it)
   - Check if `OPENROUTER_API_KEY` is set (real AI) or missing (fallback mode)
   - Check if `ADMIN_KEY` is set (needed for admin dashboard)

### First task for next session:
See "The Next Thing To Do" section above — start with the Milestone 2 schema design.

---

*Last updated: February 26, 2026 by Claude Code*
