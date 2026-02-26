# HANDOFF.md — Session Context for Future David & Claude

---

## Session Date & Summary

**Date:** February 26, 2026

**What we set out to do:**
Implement Milestone 2: AI Memory — Rolling Story Summary. The AI was only seeing the last 5 messages and "forgetting" earlier plot events, NPC names, and player decisions.

**What we accomplished:**
Milestone 2 core implementation is complete and committed (5e29dd7). Built the entire rolling story summary system: database table, summarization service, AI context injection, and background trigger logic.

---

## What Was Just Built

### Files Created/Modified This Session:

#### `shared/schema.ts`
- **Added `storySummaries` table** with session scoping, matching the pattern of all other tables
- Fields: `id`, `sessionId`, `summaryText`, `messageStartIndex`, `messageEndIndex`, `messageCount`, `summaryTokenCount`, `createdAt`, `isActive`
- Added Zod schemas (`insertStorySummarySchema`) and TypeScript types (`StorySummary`, `InsertStorySummary`)

#### `server/summaryService.ts` (NEW FILE)
- **`generateStorySummary(sessionId, messages, previousSummary?)`** — Main function that calls Claude 3.5 Haiku to condense messages into narrative summary
- Uses same OpenRouter setup as aiService.ts
- Handles previous summary incorporation (weaves old + new into cohesive narrative)
- Tracks costs via `spendTracker.trackRequest()`
- Returns `{ summaryText, tokenUsage, error? }`
- System prompt instructs AI to preserve: plot points, NPC names/relationships, quest progress, player decisions, locations, character development
- System prompt instructs AI to exclude: stats, quest lists, inventory, exact dialogue
- Target output: ~400 words (~600 tokens)

#### `server/dbStorage.ts`
- **`getActiveSummary(sessionId)`** — Returns the current active summary (where `isActive = true`)
- **`createSummary(sessionId, summary)`** — Inserts new summary with `isActive = true`
- **`deactivateSummaries(sessionId)`** — Marks all summaries for session as `isActive = false`
- **Updated `clearAllAdventureData()`** — Now also clears `storySummaries` table

#### `server/storage.ts`
- Added interface methods to `IStorage`: `getActiveSummary`, `createSummary`, `deactivateSummaries`
- Added stub implementations to `MemStorage` (backup class)

#### `server/aiService.ts`
- **Added constants**: `SUMMARY_THRESHOLD = 10`, `RECENT_MESSAGE_WINDOW = 5`
- **Updated `getGameContext()`** — Now also fetches `storySummary` via `storage.getActiveSummary()`
- **Updated `createContextPrompt()`** — Injects "STORY SO FAR" section between game state and recent messages (only if summary exists)
- **Added `checkAndTriggerSummarization()`** — Private method that:
  1. Counts total messages and gets current summary
  2. Calculates unsummarized count
  3. If >= 10 unsummarized, triggers summarization
  4. Deactivates old summaries, creates new one
  5. Wrapped in try/catch — failures don't block response
- **Called as fire-and-forget** — `this.checkAndTriggerSummarization(sessionId).catch(...)` runs in background, doesn't block user's story response
- **Fixed stale headers** — Changed "AI Tavern" → "Story Mode" in HTTP-Referer and X-Title

#### Also fixed in `server/summaryService.ts`:
- Headers updated to "Story Mode" branding

---

## Key Design Decisions Made This Session

### 1. New table vs column on gameState
**Chosen:** New `story_summaries` table

**Why:** Summaries can grow large (500-1500 tokens). Separate table enables keeping historical summaries for debugging (`isActive = false`), clean separation of concerns, and metadata tracking (message range, token count).

### 2. Single rolling summary vs chained summaries
**Chosen:** Single rolling summary per session that gets replaced

**Why:** Simpler implementation, lower token cost. Each new summary incorporates the previous one and covers all messages up to the recent window.

### 3. Summarization trigger threshold
**Chosen:** Every 10 unsummarized messages

**Why:** Balances cost (~$0.003 per summarization) with context freshness. Too frequent = expensive. Too infrequent = stale summaries.

### 4. Keep historical summaries
**Chosen:** Old summaries marked `isActive = false`, not deleted

**Why:** Useful for debugging and auditing. Can see how summaries evolved over an adventure. Storage cost is negligible.

### 5. Non-blocking (fire-and-forget) summarization
**Chosen:** Summarization runs in background, doesn't block story response

**Why:** Avoids 1-2 second latency spike every 10 messages. Trade-off: new summary available for NEXT response, not current one. Acceptable because the user still gets their response immediately.

---

## Current State of the App

### What works right now (`npm run dev`):

1. **Everything from Milestone 1** — Session persistence, isolation, character creation, chat, quests, inventory
2. **Rolling story summary** — After 15 messages, the AI will have a summary of messages 1-10 injected into its context
3. **Admin dashboard** — `/admin` shows spend metrics including summarization costs

### Smoke test for Milestone 2:
1. Start a new adventure (clear localStorage to get fresh session)
2. Send 15+ messages back and forth with the AI
3. Watch server logs for:
   - `[AI Service] Triggering summarization`
   - `[SummaryService] Summary generated successfully`
   - `[AI Service] Summary created successfully`
4. On message 16+, logs should show `hasSummary: true`
5. Reference something from message 2-3 in your message 20 — AI should remember it

---

## What Still Needs Doing for Milestone 2

### Testing & Tuning:
- [ ] Live testing with a real 15+ message adventure to verify summarization triggers correctly
- [ ] Verify the AI actually references earlier events when prompted
- [ ] May need to tune: summary quality (prompt tweaks), trigger threshold (10 might be too frequent/infrequent), recent message window size (5 might be too small)

### Nice to have:
- [ ] Add summary info to admin dashboard (how many summaries exist, total token costs for summaries)
- [ ] Add a way to manually trigger re-summarization if summary quality is poor

---

## Exact State of Every Milestone

| Milestone | Status | Description |
|-----------|--------|-------------|
| 0. Local Dev | ✅ Done | Repo runs locally with npm run dev |
| 1. Foundation | ✅ Done | Real DB persistence, session isolation |
| 2. AI Memory | ✅ Done (needs testing) | Rolling story summary |
| 3. Brand Redesign | Not started | Pastel Playground UI (frontend only) |
| 4. Production | Not started | Error handling, monitoring, deploy |
| 5. World Generation | Not started | AI builds worlds from character backstory |

### Milestone 2: AI Memory — Rolling Story Summary ✅
**Core implementation complete.** Committed as `5e29dd7`.

What was built:
- `story_summaries` table with session scoping
- `summaryService.ts` with AI-powered summarization
- Context injection in `aiService.ts`
- Background trigger every 10 messages
- Non-blocking (fire-and-forget) execution

What remains:
- Live testing with real conversations
- Tuning summary quality and trigger thresholds

---

## Next Milestones

### Milestone 3: Brand Redesign (Pastel Playground UI)
**Frontend only.** Apply the Pastel Playground color palette from CLAUDE.md:
- Cream background (#FFF9F0)
- Soft indigo text (#6C7A89)
- Peachy pink CTAs (#FFB6B9)
- Mint green success (#A8E6CF)
- Lavender secondary (#C9B6E4)

No pure black, no dark mode, mobile-first design.

### Milestone 4: Production Deployment
Error handling improvements, monitoring dashboards, Render deployment optimization.

### Milestone 5: World Generation (NEW)
AI builds tonally matched worlds from character backstory. Universal tavern pattern — every story starts in that world's version of a gathering place. Heavy prompt engineering focus. **Depends on Milestone 2** (AI needs memory to maintain world consistency).

---

## The Next Thing To Do

**Ready-to-paste Claude Code prompt for the next session:**

```
Read HANDOFF.md and CLAUDE.md in full before doing anything.

Milestone 2 (AI Memory) is implemented but needs live testing.

Task: Test the rolling story summary system end-to-end.

1. Start a fresh adventure (clear localStorage, refresh)
2. Play through 15+ messages with the AI
3. After message 15, check server logs for summarization
4. On message 20+, ask the AI about something from message 2-3
5. Report: Did the AI remember? Was summarization triggered? Any errors?

If issues found, debug and fix. If working, we can move to Milestone 3 (Brand Redesign).
```

---

## Loose Ends & Watch Outs

### Half-done:
- **Summary quality untested** — The summarization prompt may need tuning based on real output quality

### Known behaviors:
- **First summary triggers on message 15** — Because we need 10 unsummarized + 5 recent window
- **Summary available for NEXT response** — Fire-and-forget means current response won't have the just-generated summary

### Things that could break:
- **If summarization fails**, the story still works — it just won't have summary context (same as before Milestone 2)
- **If OPENROUTER_API_KEY not set**, summarization will fail silently (logged but not blocking)

### Decisions deferred:
- **Summary in admin dashboard** — Showing summary counts and costs would be useful but not critical
- **Manual re-summarization** — Could be useful if a summary is poor quality

---

## Environment & Infra State

### `.env` variables (names only):
```
OPENROUTER_API_KEY    # Required for real AI responses AND summarization
DATABASE_URL          # Supabase PostgreSQL connection string
PORT                  # Server port (default 5000, dev uses 3000)
NODE_ENV              # development | production
SENTRY_DSN            # Optional error tracking
ADMIN_KEY             # Required for /api/admin/* endpoints
```

### Database state:
- **New table**: `story_summaries` with `session_id` column for isolation
- **Existing tables**: `characters`, `quests`, `items`, `messages`, `game_state`

### Recent commits:
```
5e29dd7 feat: add rolling story summary for AI memory (Milestone 2)
1959d50 docs: add session handoff document
5e5ad9b fix: correct token cost calculation, update CLAUDE.md for milestone 2
```

---

## How To Resume

### Before writing any code:

1. **Read context files:**
   ```bash
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
   - Create a character or continue existing adventure
   - Send messages in Story tab
   - Watch server logs for `[AI Service]` and `[SummaryService]` output

4. **Check git status:**
   ```bash
   git status        # Should be clean
   git log --oneline -5  # See recent commits
   ```

### First task for next session:
See "The Next Thing To Do" section above — test the Milestone 2 implementation end-to-end.

---

*Last updated: February 26, 2026 by Claude Code*
