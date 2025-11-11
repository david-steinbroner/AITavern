# Local Development Setup for Story Mode

## Prerequisites
- **Node.js 18+** installed ([Download](https://nodejs.org/))
- **npm** installed (comes with Node.js)
- **OpenRouter API key** ([Get one here](https://openrouter.ai/keys))

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your OpenRouter API key
# Replace 'sk-or-v1-your-key-here' with your actual key
```

Your `.env` should look like:
```env
OPENROUTER_API_KEY=sk-or-v1-abc123...
PORT=5000
NODE_ENV=development
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Access the App
Open your browser to: **http://localhost:5000**

🎉 That's it! You're ready to develop locally.

---

## How It Works

### Single Server Architecture
- One Express server serves both API and frontend
- Runs on **port 5000** (configurable via `.env`)
- Frontend and backend run together seamlessly

### Hot Reload Magic ✨
- **Frontend Changes**: Vite provides instant hot module replacement
  - Edit React components → See changes immediately
  - No page refresh needed (most of the time)

- **Backend Changes**: tsx watches files and auto-restarts
  - Edit API routes → Server restarts automatically
  - Usually takes ~1 second to restart

### In-Memory Storage
- Uses `MemStorage` class (no database needed!)
- Data initializes automatically with:
  - Default character
  - Sample quests
  - Starting items
  - Welcome message
- **Note**: Data resets when server restarts (this is expected)

---

## Development Workflow

### Making Changes

**Frontend (React/TypeScript):**
```bash
client/src/
  ├── components/     # UI components
  ├── hooks/          # Custom React hooks
  ├── lib/            # Utilities (Sentry, PostHog, etc.)
  └── App.tsx         # Main app component
```

**Backend (Express/TypeScript):**
```bash
server/
  ├── index.ts        # Server entry point
  ├── routes.ts       # API endpoints
  ├── aiService.ts    # AI dungeon master logic
  ├── storage.ts      # In-memory data storage
  └── sentry.ts       # Error tracking
```

**Shared Types:**
```bash
shared/
  └── schema.ts       # TypeScript types & DB schemas
```

### Testing Your Changes

1. **Make changes** to any file
2. **Save** the file
3. **Check the terminal** - you'll see:
   ```
   [vite] page reload client/src/components/ChatInterface.tsx
   ```
   Or:
   ```
   [tsx] restarting due to server/routes.ts change...
   ```
4. **Refresh browser** (if needed) or see changes automatically

### Testing AI Features

All AI features work locally:
- ✅ Quest generation
- ✅ AI dungeon master responses
- ✅ Character interactions
- ✅ Combat narration
- ✅ Side quest detection

Just ensure your `OPENROUTER_API_KEY` is valid in `.env`

---

## Available Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server (hot reload) |
| `npm run build` | Build for production |
| `npm start` | Run production build |
| `npm run check` | Type-check TypeScript |
| `npm run db:push` | Push database schema (if using PostgreSQL) |

---

## Troubleshooting

### Server Won't Start

**Port already in use:**
```bash
Error: listen EADDRINUSE: address already in use :::5000
```
**Fix**: Change `PORT` in `.env` to a different number (e.g., `5001`)

**API key missing:**
```bash
Error: OPENROUTER_API_KEY environment variable is not set
```
**Fix**: Ensure `.env` file exists and contains your API key

### AI Not Responding

**Check server logs** - you'll see detailed error messages:
```bash
[AI Service] Error generating AI response { error: 'Invalid API key' }
```

**Common causes:**
- Invalid API key → Get a new one from [OpenRouter](https://openrouter.ai/keys)
- Rate limit exceeded → Wait or upgrade your OpenRouter plan
- Network issues → Check your internet connection

### Data Disappeared

**This is normal!**
- In-memory storage resets when server restarts
- Each restart gives you a fresh game state
- Perfect for testing, not for long-term saves

**Want persistent data?**
- You'd need to set up PostgreSQL (see PostgreSQL Setup section below)

### Changes Not Appearing

**Frontend not updating:**
```bash
# Hard refresh the browser
Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows/Linux)
```

**Backend not restarting:**
```bash
# Check terminal - tsx should show restart messages
# If not, stop (Ctrl+C) and restart: npm run dev
```

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENROUTER_API_KEY` | ✅ Yes | `sk-placeholder` | Your OpenRouter API key for AI features |
| `PORT` | No | `5000` | Port for development server |
| `NODE_ENV` | No | `development` | Environment mode (set automatically) |
| `SENTRY_DSN` | No | - | Sentry error tracking (optional for local) |

---

## PostgreSQL Setup (Optional)

Currently, the app uses **in-memory storage**. If you want persistent data locally:

### 1. Set Up Local PostgreSQL

**Option A: Use Neon (Free, Cloud-based)**
1. Go to [Neon](https://neon.tech/)
2. Create a free database
3. Copy the connection string

**Option B: Use Docker**
```bash
docker run --name aittrpg-postgres \
  -e POSTGRES_PASSWORD=mysecretpassword \
  -e POSTGRES_DB=aittrpg \
  -p 5432:5432 \
  -d postgres
```

### 2. Add to .env
```env
DATABASE_URL=postgresql://user:password@localhost:5432/aittrpg
```

### 3. Update storage.ts
You'd need to implement a `DbStorage` class (not currently implemented)

### 4. Push Schema
```bash
npm run db:push
```

**Note**: This is completely optional. In-memory storage works great for development!

---

## Project Structure Overview

```
AITTRPG/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── hooks/          # React hooks
│   │   ├── lib/            # Utilities
│   │   └── App.tsx         # Main app
│   └── package.json
│
├── server/                 # Express backend
│   ├── index.ts            # Entry point
│   ├── routes.ts           # API endpoints
│   ├── aiService.ts        # AI logic
│   ├── storage.ts          # Data storage
│   └── package.json
│
├── shared/                 # Shared types
│   └── schema.ts
│
├── .env                    # YOUR secrets (not in git)
├── .env.example            # Template (in git)
├── package.json            # Root package file
└── LOCAL_DEVELOPMENT.md    # This file!
```

---

## Tips & Best Practices

### 1. Keep .env Secure
- ✅ Never commit `.env` to git (it's in `.gitignore`)
- ✅ Use `.env.example` as a template
- ✅ Rotate API keys if accidentally exposed

### 2. Use Console Logs
The codebase has excellent logging:
```typescript
console.log('[ComponentName] What happened', { useful: 'data' });
```

Watch the **browser console** for frontend logs
Watch the **terminal** for backend logs

### 3. Check Sentry & PostHog
- Errors auto-report to Sentry (even locally, if configured)
- Events track in PostHog for analytics
- Great for debugging real user issues

### 4. Test on Mobile
```bash
# Find your local IP
ifconfig | grep "inet "

# Access from phone on same network
http://192.168.x.x:5000
```

---

## Next Steps

### Ready to Deploy?
```bash
# 1. Commit your changes
git add .
git commit -m "Your changes"

# 2. Push to GitHub
git push

# 3. Render auto-deploys from main branch
# Check: https://dashboard.render.com
```

### Need Help?
- Check server logs (terminal where `npm run dev` is running)
- Check browser console (F12 → Console tab)
- Look for `[AI Service]` or `[App]` prefixed logs

---

## Summary

✅ **One command to start**: `npm run dev`
✅ **Instant feedback**: Hot reload on save
✅ **Full AI features**: Works just like production
✅ **No database needed**: In-memory storage
✅ **Easy debugging**: Console logs everywhere

Happy coding! 🚀
