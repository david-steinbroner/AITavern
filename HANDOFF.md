# HANDOFF.md — Session Context for Future David & Claude

---

## Session Date & Summary

**Date:** March 16, 2026 (evening session)

**What happened this session:**
Completed most of Milestone 5 (Polish, Bugs & UX Overhaul). Fixed the two major bugs (story isolation, End button), then did a full UX overhaul of the story reading screen plus story creation flow simplification. Also packaged 23 Claude Code skills into a plugin for Cowork.

**What we accomplished:**
1. **Bug fixes:** Story isolation (storyId threading through aiService), End button (PATCH instead of DELETE, with AlertDialog confirmation)
2. **Story screen overhaul:** Removed mic button, text input, progress bar. Added consolidated top nav with dropdown menu, page indicator, font size controls. Moved choices to collapsible bottom drawer. Added smart auto-scroll.
3. **Icon/emoji cleanup:** Stripped all decorative icons and emojis from every screen for a cleaner literary feel.
4. **"Surprise me" button:** New `POST /api/story/surprise-me` endpoint + frontend button for AI-generated character descriptions.
5. **Genre step removed:** Simplified story creation from 3 steps to 2. AI infers genre from character description.
6. **Tooltip fix:** Replaced info box with popover tooltip on character description.
7. **Cowork plugin:** Packaged 23 relevant skills from Claude Code into `story-mode-plugin/skills/` for use in Cowork sessions.

**Key decisions:**
- Genre selection was removed entirely — AI infers genre from character description. Genre stored as "auto" in DB.
- Story choices are now in a bottom drawer instead of inline in message bubbles. Messages show pure narrative text.
- Single consolidated nav bar replaces the separate header in App.tsx and header in ChatInterface.

---

## Previous Sessions

**March 16, 2026 (morning):** Shipped M3, M5, and multi-story support. App went from flat chat to bookshelf-based story reader with page structure, pacing, and multiple stories per session. Cleaned up 15 dead component/hook files.

**March 15, 2026:** Major creative pivot. V2 brainstorm with Rachel — bookshelf metaphor, Guide character, page-based stories. Built interactive prototype. Revised milestone roadmap.

**February 26, 2026:** Milestone 2 (Rolling Story Summary) — complete implementation committed (5e29dd7). Never live-tested.

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

## Milestone Roadmap

| # | Milestone | Status | What It Is | Depends On |
|---|-----------|--------|------------|------------|
| 0 | Local Dev | ✅ Done | Repo runs locally | — |
| 1 | Foundation | ✅ Done | DB persistence, session isolation | — |
| 2 | AI Memory | ✅ Done (needs live test) | Rolling story summary | M1 |
| 3 | Page Structure | ✅ Done | Fixed page counts, AI pacing, story completion | M2 |
| 4 | The Guide | ⚠️ Partial | Guide avatar on bookshelf; full unified personality not yet implemented | M3 |
| 5 | Polish & UX | ✅ Mostly done | Bug fixes, story screen overhaul, icon cleanup, genre removal, surprise me | M4 |
| 6 | Production | Not started | Error handling, monitoring, deploy | M5 |
| 7 | Cross-Story Travel | Not started | Character persistence across stories | M5 + users |
| 8 | Community Templates | Not started | Player-created content, voting, moderation | M7 + users |
| 9 | Adaptive Theming | Not started | Genre influences visual design | M5 |

### What's still open:
- **M2 (AI Memory):** Never live-tested. Needs a 15+ message playthrough to verify summarization triggers and recall.
- **M4 (The Guide):** Guide avatar exists on bookshelf with greetings, but the full vision (unified AI personality as narrator in stories, librarian on shelf, concierge everywhere) is not yet wired into the AI system prompt or story responses.
- **M5 remaining:** Narrator fallback error on story creation (intermittent JSON parse failure) still needs retry logic.

---

## What Was Built Today (M5 UX Overhaul)

### Bug Fixes
- **Story isolation** (58c1155): `storyId` threaded through `generateResponse()`, `getGameContext()`, `checkAndTriggerSummarization()`, `updateGameState()` in `aiService.ts`. Storage calls in `dbStorage.ts` updated for `deactivateSummaries()`.
- **End button** (6fed6d5): Changed from `DELETE /api/stories/:storyId` to `PATCH /api/game-state` with `storyComplete: true`. Fixed `storyId` scoping on the PATCH route.

### Story Screen Overhaul
- **Removed** (8c923b8): Broken mic button (speech recognition), persistent text input, StoryProgress bar from game view.
- **Page indicator** (4556fd5): Subtle "Page X of Y" / "Complete" in story header.
- **Custom input** (2f1ce2a): "I have something else in mind..." option after AI choices, reveals text input + send button.
- **Font size** (b5fc7b9): Settings gear → popover with +/- buttons, 4 sizes (14-20px), localStorage persistence.
- **Icon cleanup** (77ad0a0): Stripped all decorative icons and emojis from all screens. Only functional icons remain.
- **Surprise me** (157961d): `POST /api/story/surprise-me` endpoint (Claude 3.5 Haiku, 150 tokens). Button on character description step.
- **Genre removal** (0494a33): Story creation simplified to 2 steps. AI infers genre. Schema accepts "auto" genre.
- **Nav consolidation + bottom drawer + auto-scroll** (1e4a4e8): Single top nav bar with dropdown menu. Choices in collapsible bottom drawer. Smart auto-scroll per message type.

---

## Exact State of Every File Area

### Foundation (M1) — solid:
- `server/db.ts` — DB connection pool
- `server/dbStorage.ts` — All CRUD with session + storyId scoping
- `server/storage.ts` — IStorage interface (updated with storyId and summary methods)
- `shared/schema.ts` — Drizzle schema (includes storySummaries, page fields, storyId)
- `client/src/lib/queryClient.ts` — Session ID + Story ID header injection

### AI Memory (M2) — built, needs live test:
- `server/summaryService.ts` — Summarization service
- `server/aiService.ts` — Context injection, background trigger, page pacing, storyId scoping

### Story Screen (M5 overhaul) — shipped:
- `client/src/components/ChatInterface.tsx` — Full story reading screen: sticky nav bar with dropdown menu, message display (pure narrative, no inline choices), collapsible bottom drawer for choices, font size controls, End Story with AlertDialog, smart auto-scroll
- `client/src/App.tsx` — Simplified game view, delegates all UI to ChatInterface (removed duplicate header)

### Bookshelf + Story Creation — shipped:
- `client/src/components/Bookshelf.tsx` — Home screen with bookshelf, cleaned of decorative icons
- `client/src/components/NewStoryCreation.tsx` — 2-step wizard (page count → character description) with "Surprise me" button and info popover

### Server routes:
- `server/routes.ts` — Includes `POST /api/story/surprise-me`, updated `POST /api/story/new` (accepts "auto" genre, AI infers genre from character description)

### Already deleted (from 8a380be cleanup):
- CombatInterface, CharacterCreation, CharacterQuestionnaire, AbilityScoreRoller, CampaignManager, and 10 other dead files

### Still scheduled for deletion:
- `users`, `enemies`, `campaigns` tables and related routes
- `MemStorage` class in `server/storage.ts`

---

## Recent Commits (this session)

```
1e4a4e8 feat: story screen UX overhaul — consolidated nav, bottom drawer choices, auto-scroll
0494a33 feat: remove genre step, simplify story creation to 2-step flow
157961d feat: add "Surprise me" button for AI-generated character descriptions
77ad0a0 style: remove decorative icons and emojis from UI for cleaner literary feel
b5fc7b9 feat: add font size controls behind settings icon on story screen
2f1ce2a feat: add "I have something else in mind" custom input option to story choices
4556fd5 feat: add subtle page indicator to story screen header
8c923b8 fix: remove broken mic button, persistent text input, and progress bar from story screen
6fed6d5 fix: End button marks story finished instead of deleting it
58c1155 fix: thread storyId through AI service to fix story isolation bug
```

---

## The Next Thing To Do

### Remaining M5 work:
- **Narrator fallback error** — Intermittent JSON parse failure on first AI response for new stories. Needs retry logic or better error recovery.

### Then consider:
- **Option A: Live-test M2 (AI Memory)** — Play through a 15+ message story to verify rolling summaries work end-to-end.
- **Option B: Finish M4 (The Guide)** — Wire the Guide's personality into the AI system prompt for story narration, not just bookshelf greetings.
- **Option C: M6 (Production Hardening)** — Error handling, rate limiting improvements, deploy pipeline.
- **Option D: Bookshelf for "auto" genre** — Stories with genre "auto" show as generic on the bookshelf. Could have the AI return a genre tag in its first response and update the record.

### Recommended order: A → D → B → C

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
- **Applied migrations**: `001` (base), `002` (sessions), `003_add_page_structure`, `004_add_story_id`
- **All tables have**: `session_id` and `story_id` columns for isolation
- **Genre column**: Now accepts "auto" for AI-inferred genre stories

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

*Last updated: March 16, 2026 (evening) by David + Claude Code*
