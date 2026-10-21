<div align="center">

# DevlStreak

**Track your progress. Build your legacy.**

Turn your GitHub activity into a visual journey of growth — streaks, XP, levels, achievements, and shareable cards, all in one place.

[![Status: Development][status-badge]][repo-url]
[![License: MIT][license-badge]][license-url]

<br/>

[**Report a Bug**][issues-url]&nbsp;&nbsp;·&nbsp;&nbsp;[**Request a Feature**][issues-url]

</div>

---

## What it does

DevlStreak connects to your GitHub account and transforms your contribution data into a personal progression experience.

- **Streaks** — track consecutive days of activity
- **XP & Levels** — grow continuously based on what you build
- **Achievements** — unlock milestones as you hit personal records
- **Statistics Hub** — heatmap, trends, and history in one dashboard
- **Shareable Cards** — public profile cards and badges at `/u/[username]`

## Pillars

| | |
|---|---|
| **Activity Tracking** | Aggregates your development activity from connected sources |
| **Statistics Hub** | Interactive dashboard with history, trends, and comparisons |
| **Gamification** | Streaks, XP, levels, weekly goals, and achievements |
| **Shareable Identity** | Cards and badges to share your progress anywhere |


## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI & Styling | Tailwind CSS v4, Lucide Icons |
| Auth | NextAuth.js v5 (GitHub OAuth) |
| Database | Firebase Cloud Firestore (Spark Free Tier) |
| Data source | GitHub API (GraphQL & REST) |
| Deployment | Vercel (Hobby Free Tier) |

## Quick Start

1. Clone and install dependencies:
```bash
git clone https://github.com/renato0x/DevlStreak.git
cd DevlStreak
npm install
```

2. Configure environment variables in `.env.local` (copy from `.env.example`):
```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
AUTH_SECRET=your_auth_secret
AUTH_URL=http://localhost:3000

# Firebase Cloud Firestore (Spark Free Plan)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

For the production Vercel URL, set `AUTH_URL` to the deployed origin and configure the GitHub OAuth App callback URL as:

```text
https://devl-streak.vercel.app/api/auth/callback/github
```

GitHub activity syncs automatically when the dashboard opens, then at most once per hour while it remains open. OAuth credentials stay in the server-only `githubCredentials` Firestore collection and are never sent to the browser.

Achievements also unlock developer stickers. Select one unlocked sticker in the dashboard to feature it on your public profile; the unlock ledger remains server-managed and cannot be changed from the browser.

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## License

Distributed under the MIT License. See [`LICENSE`][license-url] for details.

---

<div align="center">

**[renato0x](https://github.com/renato0x)**

</div>

<!-- Badges -->
[status-badge]: https://img.shields.io/badge/status-development-violet?style=flat-square
[license-badge]: https://img.shields.io/github/license/renato0x/DevlStreak?style=flat-square&color=blue

<!-- Links -->
[repo-url]: https://github.com/renato0x/DevlStreak
[license-url]: https://github.com/renato0x/DevlStreak/blob/master/LICENSE
[issues-url]: https://github.com/renato0x/DevlStreak/issues
