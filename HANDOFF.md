# HANDOFF.md — Session Context for Future David & Claude

---

## Session Date & Summary

**Date:** March 15, 2026

**What happened this session:**
Major creative pivot. David and Rachel brainstormed a new vision for Story Mode V2 — a storybook/bookshelf metaphor with a persistent AI Guide character, page-based story structure, and community features. Built an interactive prototype of the new UI. Revised the entire milestone roadmap to align with this new direction.

**What we accomplished:**
1. Captured all V2 brainstorm ideas in `STORY_MODE_V2_BRAINSTORM.md`
2. Built a full interactive prototype (`story-mode-prototype.html`) with four views: bookshelf, story reading, new story creation, public library
3. Revised the milestone roadmap (see below)

**Key decision:** This is a pivot in the presentation and interaction layer, NOT the foundation. All Milestone 1 (DB, sessions) and Milestone 2 (AI memory) work still applies.

---

## Previous Session (February 26, 2026)

**What was built:**
- Milestone 2: Rolling Story Summary — complete implementation committed (5e29dd7)
- `story_summaries` table, `summaryService.ts`, context injection in `aiService.ts`
- Background summarization trigger every 10 messages (fire-and-forget)

**Status:** Code-complete, never live-tested. Still needs a real 15+ message playthrough to verify.

---

## The V2 Vision (Summary)

Full details in `STORY_MODE_V2_BRAINSTORM.md`. Core concepts:

1. **Bookshelf UI** — Home screen is a bookshelf. Each story is a physical book you pull off the shelf to read.
2. **The Guide** — A persistent AI character (friendly wisp/orb) that's the librarian on the shelf, the narrator in stories, and the concierge everywhere else. One voice, one personality, across the whole app.
3. **Page-based stories** — Stories have fixed page counts (25, 50, 100, 250). One page = one AI reply. Enables pacing, cost control, progress tracking, and the concept of a "finished" story.
4. **Cross-story character travel** — Finish a story, carry your character into a new one. Break the 4th wall.
5. **Community templates** — Player-created worlds/characters can be nominated and voted on to become templates for others.
6. **Adaptive visual theming** — Story genre/tone influences the visual design (backgrounds, colors) as the story develops.

---

## Revised Milestone Roadmap

| # | Milestone | Status | What It Is | Depends On |
|---|-----------|--------|------------|------------|
| 0 | Local Dev | ✅ Done | Repo runs locally | — |
| 1 | Foundation | ✅ Done | DB persistence, session isolation | — |
| 2 | AI Memory | ✅ Built (needs testing) | Rolling story summary | M1 |
| **3** | **Page Structure** | **Not started** | **Fixed page counts, AI pacing awareness, story completion** | **M2** |
| **4** | **The Guide** | **Not started** | **Unified AI character across all app contexts** | **M3** |
| **5** | **Bookshelf UI** | **Not started** | **Replace flat UI with bookshelf metaphor (prototype exists)** | **M4** |
| 6 | Production | Not started | Error handling, monitoring, deploy | M5 |
| 7 | Cross-Story Travel | Not started | Character persistence across stories | M5 + users |
| 8 | Community Templates | Not started | Player-created content, voting, moderation | M7 + users |
| 9 | Adaptive Theming | Not started | Genre influences visual design | M5 |

### Old milestones → new mapping:
- Old M3 (Brand Redesign) → **absorbed into new M5 (Bookshelf UI)**. The redesign happens because of a better interaction model, not just new colors.
- Old M5 (World Generation) → **absorbed into new M3 (Page Structure)**. World gen is part of the "New Story" flow now.

---

## Milestone 3: Page Structure (NEXT)

This is the keystone feature. Everything else depends on it.

### What needs to happen:

**Schema changes:**
- Add `totalPages` (integer) and `currentPage` (integer) to the story/game state
- Add `storyLength` tier enum or field: 'short' (25), 'novella' (50), 'novel' (100), 'epic' (250)
- Each AI reply increments `currentPage`
- Story is "complete" when `currentPage >= totalPages`

**AI prompt changes:**
- System prompt now includes: "You are writing page {current} of {total}."
- Pacing guidance injected based on position in story:
  - Pages 1-20%: Setup, world-building, character introduction
  - Pages 20-50%: Rising action, complications, relationships deepen
  - Pages 50-75%: Escalation, stakes increase, plot twists
  - Pages 75-90%: Climax, confrontation, peak tension
  - Pages 90-100%: Resolution, consequences, ending
- Final page prompt: "This is the last page. Bring the story to a satisfying conclusion."
- Number of choices may reduce near the end (funnel toward resolution)

**New Story flow:**
- User picks genre, story length, describes character
- AI generates opening page (world, setting, first scene, first choices)
- This replaces the old character creation → world generation as separate steps

**Story completion:**
- When `currentPage >= totalPages`, the story is marked complete
- The Guide acknowledges the ending
- Player can: start a new story, re-read the finished book, (later) carry character forward

### What stays the same:
- Database layer (Supabase + Drizzle)
- Session isolation pattern
- Rolling summary system (even more important now for pacing)
- Message storage (each page is still a message pair)

---

## The Prototype

**Location:** `story-mode-prototype.html` (also in project root as build artifact)
**Source:** `/sessions/happy-sharp-albattani/story-mode-prototype/` (Cowork session artifact)

The prototype demonstrates:
- Bookshelf with wooden shelves, book spines, bookmarks, completion stars
- The Guide character (animated wisp/orb with speech bubbles)
- Story reading view with serif typography, page numbers, progress bar, animated choices
- New Story flow (genre → length → character description)
- Public Library (community templates with voting)
- Pastel Playground color palette throughout

This is a **visual reference**, not production code. The real implementation will be built into the existing React + Express codebase.

---

## Exact State of Every File Area

### Foundation (M1) — solid, no changes needed:
- `server/db.ts` — DB connection pool
- `server/dbStorage.ts` — All CRUD with session scoping
- `server/storage.ts` — IStorage interface
- `shared/schema.ts` — Drizzle schema (will need additions for M3)
- `client/src/lib/queryClient.ts` — Session ID header injection

### AI Memory (M2) — built, needs live test:
- `server/summaryService.ts` — Summarization service
- `server/aiService.ts` — Context injection, background trigger
- `shared/schema.ts` — `storySummaries` table

### Scheduled for deletion (unchanged from before):
- `CombatInterface.tsx`, `CharacterCreation.tsx`, `CharacterQuestionnaire.tsx`, `AbilityScoreRoller.tsx`
- `CampaignManager.tsx`
- `users`, `enemies`, `campaigns` tables
- `MemStorage` class

---

## The Next Thing To Do

**Step 1: Test Milestone 2 (AI Memory)**

Before building anything new, verify the rolling summary system actually works:

```
Read HANDOFF.md and CLAUDE.md in full before doing anything.

Milestone 2 (AI Memory) was implemented Feb 26 but never live-tested.

Task: Test the rolling story summary system end-to-end.

1. Start a fresh adventure (clear localStorage, refresh)
2. Play through 15+ messages with the AI
3. After message 15, check server logs for summarization trigger
4. On message 20+, reference something specific from early messages
5. Report: Did the AI remember? Was summarization triggered? Any errors?

If issues found, debug and fix. If working, move to Step 2.
```

**Step 2: Implement Milestone 3 (Page Structure)**

```
Read HANDOFF.md (especially the "Milestone 3: Page Structure" section).
Read STORY_MODE_V2_BRAINSTORM.md for full context on the V2 vision.

Task: Implement page-based story structure.

1. Add totalPages, currentPage, storyLength fields to schema
2. Update aiService.ts system prompt to include page position and pacing guidance
3. Add page increment logic when AI responds
4. Add story completion detection
5. Update the New Story API to accept genre + storyLength + characterDescription
6. Test: Start a 25-page story, verify page counting and AI pacing awareness

Do NOT touch the frontend yet — we'll do the UI overhaul in Milestone 5.
Keep the existing chat interface working; just add page tracking underneath.
```

---

## Environment & Infra State

### `.env` variables (names only):
```
OPENROUTER_API_KEY    # Required for AI responses + summarization
DATABASE_URL          # Supabase PostgreSQL connection string
PORT                  # Server port (default 5000, dev uses 3000)
NODE_ENV              # development | production
SENTRY_DSN            # Optional error tracking
ADMIN_KEY             # Required for /api/admin/* endpoints
```

### Database state:
- **Tables**: `characters`, `quests`, `items`, `messages`, `game_state`, `story_summaries`
- **Pending schema additions (M3)**: `totalPages`, `currentPage`, `storyLength` on game state

### Recent commits:
```
5e29dd7 feat: add rolling story summary for AI memory (Milestone 2)
1959d50 docs: add session handoff document
5e5ad9b fix: correct token cost calculation, update CLAUDE.md for milestone 2
```

---

## Key Reference Files

| File | Purpose |
|---|---|
| `CLAUDE.md` | Engineering operating manual — read first every session |
| `HANDOFF.md` | This file — session context and next steps |
| `STORY_MODE_V2_BRAINSTORM.md` | V2 vision doc (bookshelf, Guide, pages, community) |
| `story-mode-prototype.html` | Interactive UI prototype for V2 |
| `design_guidelines.md` | Brand specs (Pastel Playground palette) |

---

*Last updated: March 15, 2026 by David + Claude (Cowork)*
