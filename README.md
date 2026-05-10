# ClearGroup

**AI-powered WhatsApp group chat analyser** — turn your WhatsApp project group into a clean dashboard in 30 seconds.

---

## Tech Stack

| Layer       | Technology                             |
|-------------|----------------------------------------|
| Framework   | Next.js 14 (App Router)                |
| Language    | TypeScript                             |
| Styling     | Tailwind CSS + custom design tokens    |
| Animations  | Framer Motion                          |
| Icons       | Lucide React                           |
| Auth        | NextAuth v4 (Google OAuth)             |
| Deployment  | Vercel                                 |

---

## Local Development

### 1. Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### 2. Clone & install

```bash
git clone <your-repo-url>
cd cleargroup
npm install
```

### 3. Environment variables

Create a `.env.local` file in the project root:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_here

# Google OAuth (from console.cloud.google.com)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 4. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Build for production

```bash
npm run build
npm start
```

---

## Deploy to Vercel

### Option A — Vercel CLI (recommended)

```bash
# 1. Install Vercel CLI globally
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy (first time — sets up the project)
vercel

# 4. Deploy to production
vercel --prod
```

Follow the interactive prompts on first run:
- **Set up and deploy**: Yes
- **Which scope**: your Vercel account
- **Link to existing project**: No (create new)
- **Project name**: cleargroup (or anything you like)
- **Directory**: `./` (current directory)

### Option B — GitHub + Vercel Dashboard

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repo
4. Vercel auto-detects Next.js — click **Deploy**

### Add environment variables on Vercel

After deploying, go to:  
**Vercel Dashboard → Project → Settings → Environment Variables**

Add all the same keys from `.env.local`:
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` → set to your production URL, e.g. `https://cleargroup.vercel.app`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

Then **redeploy** for the env vars to take effect:

```bash
vercel --prod
```

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout (Navbar + Footer)
│   ├── page.tsx            # Home page (all sections)
│   └── globals.css         # Tailwind + custom keyframes
├── components/
│   ├── layout/             # Navbar, Footer, MobileMenu, Providers
│   ├── sections/           # HeroSection, TrustBar, HowItWorks, FeaturesSection,
│   │                       # ComparisonSection, CTASection + sub-panels
│   └── ui/                 # AnimatedSection, AnimatedItem
└── constants/
    ├── index.ts            # APP_NAME, ROUTES, NAV_LINKS
    └── animations.ts       # Shared Framer Motion Variants
```

---

## Design Tokens

| Token           | Value     | Usage                     |
|-----------------|-----------|---------------------------|
| `--cg-bg`       | `#0A0A0F` | Page background           |
| `--cg-surface`  | `#111118` | Card / panel backgrounds  |
| `--cg-border`   | `#1E1E2E` | Borders                   |
| `--cg-primary`  | `#6366F1` | Indigo — primary actions  |
| `--cg-secondary`| `#8B5CF6` | Violet — accents          |
| `--cg-text`     | `#F8F8FF` | Primary text              |
| `--cg-muted`    | `#9CA3AF` | Secondary / muted text    |

---

## License

MIT
