# ClearGroup — AI-Powered WhatsApp Project Dashboard

> Turn your WhatsApp group chaos into a structured project dashboard in 30 seconds.

**Live demo:** [cleargroup.vercel.app](https://cleargroup.vercel.app)

---

## The Problem

Indian college students run their entire project coordination through WhatsApp groups. Every task assignment, deadline, blocker, and decision is buried inside a stream of Hinglish messages — mixed with memes, jokes, and off-topic conversation. When submission day arrives, nobody knows what was actually decided, who is doing what, or whether Vivek ever finished the frontend.

This is not a workflow problem. It is an **information retrieval problem**. The data exists — it is just unstructured.

**ClearGroup solves this by parsing that WhatsApp export and using AI to extract the structure that was always there.**

---

## What It Does

Upload a WhatsApp group chat export. In under 30 seconds, ClearGroup produces a full project dashboard:

| Feature | What you get |
|---|---|
| **Task Board** | Every task extracted per person, with status (pending / in progress / done / overdue), deadline, confidence score, and the exact message that proves the commitment |
| **Decision Log** | Every technology choice, agreement, and confirmation — with evidence |
| **Blocker Alerts** | Silent members, unanswered questions, unresolved conflicts — with severity (low / medium / high) |
| **Deadline Tracker** | Every date mentioned in the chat, with a countdown |
| **Open Questions** | Every question that was asked but never answered |
| **Participation Chart** | Message count per person, collaboration score, most/least active member |
| **AI Insight** | One specific, data-driven sentence about the project's current state (e.g. "Vivek has gone silent for 2 days while frontend remains incomplete before Friday deadline") |
| **Ask AI** | Natural language Q&A about your project — "Who is doing the backend?", "What did we decide about the database?" |
| **Team Join Flow** | Share an invite code → teammates join → their tasks are highlighted in the board |
| **Real-time Updates** | Task status updates sync across all team members live via Supabase |

---

## Who It Is For

- **College students** running group projects through WhatsApp
- **Hackathon teams** who sprint hard and lose track of who owns what
- **Small startup teams** in India who default to WhatsApp for coordination
- **Any group** where decisions and tasks live in a chat thread instead of a project management tool

---

## Demo Flow

### Step 1 — Landing page
Visit [cleargroup.vercel.app](https://cleargroup.vercel.app). The before/after comparison slider shows a raw WhatsApp chat on the left and the structured dashboard output on the right.

### Step 2 — Upload
Go to `/upload`. Either:
- **Drag and drop** your WhatsApp `.txt` or `.zip` export
- Click **"Try with sample chat"** to see a pre-loaded Hinglish project conversation

Select a date range (last 24h / 3 days / 7 days / custom), then click **Analyze My Chat**.

### Step 3 — Processing
A live animation shows the chat being scanned. Status messages cycle through extraction steps every ~1 second. Large chats show a "this may take up to 30 seconds" notice after 15 seconds.

### Step 4 — Dashboard
The full project dashboard loads with real extracted data — tasks, decisions, blockers, deadlines, participation stats, and an AI-generated insight specific to the chat.

### Step 5 — Team
Copy the invite code from the sidebar. Share `cleargroup.vercel.app/join/[CODE]`. Teammates enter their name and land on the same dashboard with their own tasks highlighted.

---

## Technical Architecture

### Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode, no `any`) |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Icons | Lucide React |
| AI | Google Gemini 2.5 Flash |
| Database | Supabase (PostgreSQL + Realtime) |
| Auth | NextAuth.js v4 + Google OAuth |
| Deployment | Vercel (60s max function duration) |

### Directory Structure

```
src/
├── app/
│   ├── page.tsx                  # Landing page (Hero, Features, How it Works, CTA)
│   ├── upload/page.tsx           # Upload flow — file input, sample chat, date filter
│   ├── dashboard/
│   │   ├── layout.tsx            # Sidebar + mobile tab bar shell
│   │   └── page.tsx              # Main dashboard (all sections + normalizers)
│   ├── join/[code]/page.tsx      # Team join flow — enter name, get redirected
│   ├── auth/signin/page.tsx      # Google OAuth sign-in page
│   └── api/
│       ├── analyze/route.ts      # POST — send chat to Gemini, return AnalysisResult
│       ├── ask/route.ts          # POST — Ask AI conversational Q&A
│       ├── projects/create/      # Create a project entry in Supabase
│       ├── projects/join/        # Validate invite code, join project
│       └── tasks/update/         # Update task status (triggers realtime)
├── components/
│   ├── sections/                 # Landing page sections (Hero, Features, Comparison, etc.)
│   ├── upload/                   # Upload zone state machine components
│   │   ├── UploadZone.tsx        # Orchestrator — switches between Idle/Uploaded/Processing
│   │   ├── UploadZoneIdle.tsx    # Drag-and-drop area with sample chat button
│   │   ├── UploadZoneUploaded.tsx# File info + date range filter + Analyze button
│   │   └── UploadZoneProcessing.tsx  # Animated progress ring + message scan preview
│   ├── dashboard/                # All dashboard section components
│   │   ├── OverviewSection.tsx   # Stat cards + AI insight banner
│   │   ├── TaskBoard.tsx         # Per-person task columns with status toggles
│   │   ├── TaskCard.tsx          # Individual task with confidence dots + evidence tooltip
│   │   ├── PersonColumn.tsx      # Column per team member with progress bar
│   │   ├── DecisionLog.tsx       # Vertical timeline of decisions
│   │   ├── BlockerAlerts.tsx     # Severity-coded blocker cards with nudge button
│   │   ├── DeadlineTracker.tsx   # Horizontal date pills with countdown
│   │   ├── OpenQuestions.tsx     # Dismissible unanswered question cards
│   │   ├── ParticipationChart.tsx# Message distribution bars + collaboration score
│   │   ├── AskAI.tsx             # Chat interface for Q&A about the project
│   │   ├── Sidebar.tsx           # Desktop nav with session stats + invite code
│   │   ├── MobileTabBar.tsx      # Fixed bottom nav for mobile
│   │   ├── StatCard.tsx          # Animated count-up card with health bar
│   │   ├── MembersPanel.tsx      # Team member list with join status
│   │   └── NudgeModal.tsx        # Send a nudge to a blocked team member
│   ├── layout/                   # Navbar, Footer, mobile menu, announcement banner
│   └── ui/                       # Shared primitives (Toast, AnimatedSection, GoogleIcon)
├── lib/
│   ├── parser.ts                 # WhatsApp .txt parser + formatChatForAI
│   ├── analysisPrompt.ts         # Gemini prompt (Hinglish-aware, generous extraction)
│   ├── sampleChat.ts             # Built-in demo chat (5 participants, rich Hinglish data)
│   ├── fileExtractor.ts          # .zip extraction via JSZip
│   ├── supabase.ts               # Supabase client (browser + server)
│   ├── auth.ts                   # NextAuth config + Google provider
│   └── gemini.ts                 # Gemini client wrapper
├── hooks/
│   ├── useAnalysis.ts            # Calls /api/analyze, manages loading/retry/error state
│   ├── useRealtimeTasks.ts       # Supabase realtime task subscription by project_id
│   ├── useCountUp.ts             # Animated number counter for stat cards
│   └── useScrollY.ts             # Scroll position for navbar blur transition
└── types/
    ├── analysis.ts               # Task, Decision, Blocker, Deadline, OpenQuestion,
    │                             # ParticipationStat, AnalysisResult, AnalysisError, ErrorType
    ├── chat.ts                   # ChatMessage, ParsedChat, FilterOptions
    └── database.ts               # Supabase table row types
```

### Data Flow

```
User uploads .txt / .zip file
         │
         ▼
fileExtractor.ts
  Extracts .txt from .zip if needed (JSZip)
         │
         ▼
parser.ts — parseWhatsAppChat()
  • Regex matches DD/MM/YY, H:MM am/pm - ~Name~: message
  • Also handles [DD/MM/YYYY, H:MM:SS pm] ~ Name: message (iOS)
  • Multi-line messages joined by continuation detection
  • System messages filtered (encrypted, added, removed, missed call…)
  • Messages capped at 8,000 most recent if > 10,000 total
  • Returns ParsedChat { messages, participants, totalMessages, dateRange }
         │
         ▼
UploadZoneUploaded
  Date range filter: last 24h / 3d / 7d / custom
  filterMessagesByRange() → filtered messages array
  Live message count and participant count shown in UI
         │
         ▼
parser.ts — formatChatForAI()
  Header:
    === WHATSAPP GROUP CHAT ANALYSIS ===
    Total Participants: Rahul, Priya, Vivek, Amit, Sneha
    Total Messages: 42
    Date Range: 10/05/2026 to 11/05/2026
    === CHAT BEGINS ===
  Body: [9:00 am] Rahul: guys project deadline is this friday
  Cap: 600,000 characters
         │
         ▼
sessionStorage.setItem("chatData", formatted)
sessionStorage.setItem("chatStats", JSON.stringify(stats))
         │
         ▼
useAnalysis hook → POST /api/analyze
  Request: { formattedChat, stats: { totalMessages, participants, dateRange } }
         │
         ▼
/api/analyze route (60s Vercel function)
  1. Smart truncation: >600k → keep first 100k + last 480k
  2. buildAnalysisPrompt(chat, participants) — Hinglish-aware
  3. Gemini 2.5 Flash (temp 0.1, topP 0.95, maxTokens 8192, JSON mode)
  4. AbortController — 55s timeout, auto-retry with last 150 lines on abort
  5. Multi-stage JSON parsing:
       a. Direct JSON.parse()
       b. Remove trailing commas, re-parse
       c. Extract balanced {} objects, try each
       d. Self-repair: ask Gemini to fix its own output
  6. Validate: tasks array must exist
  7. Returns { success: true, analysis: AnalysisResult, metadata }
         │
         ▼
sessionStorage.setItem("analysisResult", JSON.stringify(analysis))
         │
         ▼
Redirect to /dashboard
  • 400ms delay before reading sessionStorage (prevents hydration flash)
  • normalizeAnalysis() guards all fields against null/undefined/wrong types
  • Four loading states: loading → ready | empty | error
  • All sections rendered from normalized AnalysisResult
```

### The Gemini Prompt Design

The core intelligence lives in `src/lib/analysisPrompt.ts`. Key decisions:

**Generous extraction over conservative.** The prompt explicitly instructs Gemini to include everything that *looks* like a task or decision. False positives are recoverable in the UI (user can dismiss). False negatives are invisible.

**Explicit Hinglish dictionary.** The prompt includes translation mappings for 15+ common phrases organized by category:

```
Task assignments:   kar le / kar do / karo / kar lena
Deadlines:          kal tak / aaj tak / friday tak
Commitment:         ho jayega / pakka / main sambhal leta hun
Completion:         ho gaya / kar diya / done
In progress:        chal raha hai / working on it
Blockers:           help chahiye / stuck hun / nahi pata
Decisions:          decided / okay (after suggestion) / yahi karenge / agreed
```

**Specific key insights.** The prompt forbids generic text and requires using real names and real issues. Bad: *"The team should improve communication."* Good: *"Vivek has gone silent for 2 days while frontend remains incomplete before the Friday 6pm deadline."*

**Collaboration score with a floor.** Minimum score is 20 (never returns 0 unless the chat is completely empty) using a structured 4-criteria rubric: message distribution (0–30), all members have tasks (0–30), quick response times (0–20), no major conflicts (0–20).

### WhatsApp Parser Details

`src/lib/parser.ts` handles the two real WhatsApp export formats:

```
Android:  10/05/26, 9:00 am - ~Rahul~: message text
iOS:      [10/05/2026, 9:00:00 am] ~ Rahul: message text
```

Edge cases handled:
- **Multi-line messages** — continuation lines without a timestamp are appended to the current message
- **System messages** — "Messages and calls are end-to-end encrypted", "Rahul added Priya", etc. are filtered out
- **Media placeholders** — `<Media omitted>`, `audio omitted` etc. become `[media]`
- **Emoji in sender names** — `Toxic 💢` is displayed as-is in the UI but stripped to `Toxic` for AI context
- **Tilde-wrapped names** — `~Sakina~` → `Sakina`
- **Long messages** — individual messages longer than 1,000 chars are truncated to 500 chars + `…` to prevent token explosion

### Upload State Machine

```
┌─────────────────┐
│   UploadZoneIdle │  ← drag/drop or "Try sample chat"
└────────┬────────┘
         │ valid file parsed
         ▼
┌──────────────────────┐
│ UploadZoneUploaded   │  ← shows stats, date filter, Analyze button
└────────┬─────────────┘
         │ Analyze clicked → sessionStorage written → onAnalyze()
         ▼
┌─────────────────────────┐
│ UploadZoneProcessing    │  ← progress ring (0→85% over 8s, holds, jumps to 100% on apiDone)
└────────┬────────────────┘
         │ apiDone = true + 1.2s delay
         ▼
      /dashboard
```

Error handling uses five typed error variants (`api_failed`, `chat_too_short`, `rate_limit`, `network_error`, `timeout`). Errors are surfaced as a dismissible `AnalysisErrorCard` back on the Uploaded state with a retry button — users never lose their uploaded file.

### Real-time Task Board

`useRealtimeTasks(projectId, tasks)` subscribes to Supabase Postgres Changes:

```ts
supabase
  .channel(`tasks:${projectId}`)
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'tasks',
    filter: `project_id=eq.${projectId}`,
  }, handleChange)
  .subscribe()
```

Status changes (pending → in_progress → done) by any team member propagate to all open dashboards instantly without a page reload.

### Dashboard Normalization

Every field returned by Gemini is normalized before rendering. This guards against malformed responses without crashing the UI:

```ts
function normalizeTask(t: unknown): Task { ... }
function normalizeDecision(d: unknown): Decision { ... }
function normalizeSummary(s: unknown): AnalysisSummary { ... }
function normalizeParticipation(p: unknown): ParticipationStat[] { ... }
```

The `participationStats` normalizer reconstructs data from raw message counts if Gemini returns empty `perPerson` arrays. The `collaborationScore` defaults to 65 (not 0) when participants exist but the score field is missing or zero.

---

## Environment Variables

```env
# AI — required for analysis to work
GEMINI_API_KEY=                    # From Google AI Studio (aistudio.google.com)

# Auth — required for sign-in
NEXTAUTH_SECRET=                   # Any random 32+ character string
NEXTAUTH_URL=                      # https://cleargroup.vercel.app
GOOGLE_CLIENT_ID=                  # From Google Cloud Console OAuth 2.0
GOOGLE_CLIENT_SECRET=              # From Google Cloud Console OAuth 2.0

# Database — required for team features
NEXT_PUBLIC_SUPABASE_URL=          # From Supabase project settings
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # From Supabase project API keys
```

> **Vercel note:** Set the `GEMINI_API_KEY` for **Production, Preview, and Development** environments, not just Production. Without it in Development, local deploys will fail.

---

## Local Development

```bash
# 1. Clone the repository
git clone https://github.com/SyedSyedain/cleargroup.git
cd cleargroup

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local with your API keys

# 4. Start development server
npm run dev
# Open http://localhost:3000

# 5. Type check (zero errors required)
npx tsc --noEmit

# 6. Production build check
npm run build
```

---

## Key Design Decisions

### Why sessionStorage instead of a database for chat data?
Chat exports contain private personal conversations. Storing them server-side raises privacy and compliance concerns. sessionStorage keeps all message content client-side and auto-purges when the tab closes. Only the AI-extracted structured data (tasks, decisions, blockers) is optionally persisted to Supabase — never the raw messages.

### Why Google Gemini instead of OpenAI GPT-4?
Gemini 2.5 Flash has a **1 million token context window** which can handle very large chat exports (thousands of messages) in a single pass without chunking or summarization. It also offers a generous free tier, making the app free to use for most Indian students. GPT-4o's 128k context window would require splitting large chats and merging results.

### Why not a dedicated Hinglish NLP model?
General-purpose LLMs with a well-crafted prompt outperform task-specific models for this use case because:
1. Project coordination language is domain-specific, not just linguistic (it requires understanding project management intent)
2. A prompt update takes minutes; retraining a model takes weeks and requires labeled data
3. Gemini already understands Hindi, English, and the code-switching patterns between them

### Why Framer Motion for all animations?
Consistency. Every animation in the app (page transitions, stat card count-ups, processing ring, pill pop-ins, task card hover states) uses the same library with the same easing curves. This gives the UI a cohesive, premium feel and makes all animations tuneable from one place.

### Why four loading states instead of boolean?
`'loading' | 'ready' | 'empty' | 'error'` prevents hydration mismatches (sessionStorage is not available during SSR), gives granular control over what to render in each state, and makes it impossible to accidentally render an empty dashboard or an error state simultaneously.

---

## Limitations & Known Issues

- **Short chats produce sparse results.** Chats under ~20 messages may not have enough signal for meaningful extraction.
- **Relative deadlines are text, not dates.** "kal tak" is extracted as a string. It is not converted to an absolute date.
- **No persistent dashboard.** Refreshing the page clears sessionStorage. Users must re-upload to regenerate the analysis. This is intentional for privacy.
- **WhatsApp format only.** Telegram, Signal, Discord, and other chat exports are not supported.
- **Gemini rate limits.** The free API tier has per-minute limits. If multiple users analyze simultaneously, some may see 429 errors and need to wait ~60 seconds.
- **Analysis quality degrades at extreme chat lengths.** Chats over 600,000 characters are smart-truncated (first 100k + last 480k characters kept). The middle section is summarized as `[...middle section trimmed for length...]`.

---

## Contributing

Contributions are welcome. The most impactful areas:

| Area | File | What to improve |
|---|---|---|
| Extraction quality | `src/lib/analysisPrompt.ts` | Add more Hinglish patterns, improve decision detection |
| Parser coverage | `src/lib/parser.ts` | Handle more WhatsApp export format variants |
| New dashboard sections | `src/components/dashboard/` | e.g. meeting summaries, action item emails |
| Mobile UX | `src/components/dashboard/MobileTabBar.tsx` | Swipeable sections on mobile |
| Export | `src/app/dashboard/` | Export dashboard as PDF or share link |

All dashboard components follow the same color system: backgrounds `#060810` / `#0C1121` / `#111828`, borders `#1A2440` / `#2A3860`, primary `#6366F1` (indigo), accent `#3B82F6` (blue).

---

## License

MIT — free to use, modify, and deploy.

---

*Built for Indian college students who coordinate their entire project in a WhatsApp group.*
