<div align="center">

# #off-topic

A member directory for GEC Palakkad's tech community.

[![React](https://img.shields.io/badge/React-18.3-blue?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.3-purple?logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8?logo=tailwindcss)](https://tailwindcss.com)

</div>

## About

#off-topic is a member directory showcasing students and alumni from GEC Palakkad. It features a beautiful card-based UI with interactive features like shuffling, filtering, and smooth animations.

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS 4** for styling
- **Framer Motion** for animations
- **Radix UI** for accessible components

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/) (recommended) or npm/yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/off-topic.git
cd off-topic

# Install dependencies
npm install
# or
pnpm install
```

### Development

```bash
# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
# Create production build
npm run build
```

The output will be in the `dist` folder.

## Features

- Browse community members in an interactive card grid
- Filter by passout year and department
- Shuffle members with animations
- Responsive design for all devices
- Beautiful hover effects and transitions

## Project Structure

```
src/
├── app/              # Main app components
│   ├── App.tsx       # Root component
│   └── components/   # UI components
├── admin/            # Password-gated admin UI (served at /admin)
├── data/             # Optional local seed data (JSON)
├── styles/           # CSS and Tailwind config
├── types/            # TypeScript type definitions
└── utils/            # Utility functions

netlify/
├── functions/        # Serverless API (members, tally webhook, admin, upload)
└── lib/              # Shared helpers (auth, blobs store, Tally parsing)
```

## Adding Members

Member data lives in **Netlify Blobs**, not in the repo. Curate it from the
password-gated admin UI at `/admin` (see [Admin](#admin) below).

`data/members.json`, when present, is only a local seed/export. The directory
no longer reads it in production — it is fetched from `/api/members`.

### Data Schema

Each member object requires the following fields:

| Field         | Type   | Description                             |
| ------------- | ------ | --------------------------------------- |
| `id`          | string | Unique identifier (e.g., "john-doe")    |
| `name`        | string | Full name of the member                 |
| `passoutYear` | number | Year of graduation                      |
| `major`       | string | Department (CSE, IT, ECE, etc.)         |
| `role`        | string | Role (Student, Software Engineer, etc.) |
| `interests`   | string | Comma-separated interests               |
| `color`       | string | Hex color for the card accent           |
| `image`       | string | URL to member's photo                   |
| `bio`         | string | Short biography                         |
| `github`      | string | GitHub username                         |
| `linkedin`    | string | LinkedIn username                       |
| `twitter`     | string | Twitter username (optional)             |
| `instagram`   | string | Instagram username (optional)           |
| `vouchedBy`   | string | Member `id` who vouched, or "og-member" |

### Example Entry

```json
{
  "id": "john-doe",
  "name": "John Doe",
  "passoutYear": 2026,
  "major": "CSE",
  "role": "Student",
  "interests": "Web Development, AI, Open Source",
  "color": "#FFB6C1",
  "image": "https://example.com/photo.jpg",
  "bio": "Passionate about building cool things on the web.",
  "github": "johndoe",
  "linkedin": "johndoe",
  "twitter": "johndoe"
}
```

### Tips

- Use consistent `passoutYear` values for filtering to work properly
- The `color` field controls the card accent — pick colors that contrast well with white
- For images, you can use any URL (hosted photos, Gravatar, DiceBear, etc.)
- Leave `twitter` as an empty string `""` if the member doesn't have one

## Admin

Member data lives in Netlify Blobs and is curated from the password-gated admin
UI at `/admin`. Two people (or more) can share the same password.

### One-time setup

1. Link the project to a Netlify site: `netlify link` (or `netlify init`).
2. Set environment variables in the Netlify UI (Site configuration →
   Environment variables), or locally in `.env` for `netlify dev`:
   - `ADMIN_PASSWORD` — shared password for `/admin` (**required**)
   - `ADMIN_SESSION_SECRET` — optional random string for signing sessions
   - `TALLY_SIGNING_SECRET` — optional, see below
3. Deploy: `pnpm deploy`, or let Netlify build from git.
4. Open `https://<your-site>/admin`, sign in, and use **Published → Import
   members.json** to load your existing `data/members.json` (or add members by
   hand).

### Tally submissions, automatically

In Tally, go to **Form → Integrations → Webhooks** and add:

- URL: `https://<your-site>/api/tally`
- Copy the **signing secret** into `TALLY_SIGNING_SECRET`

New responses then appear under the **Pending** tab. Edit anything, then
**Approve & publish** to add them to the directory (or **Reject**). Tally photo
URLs are used as-is; you can also upload a replacement photo in the form.

### Local development

```bash
cp .env.example .env    # set ADMIN_PASSWORD
pnpm dev:netlify        # Vite + Functions + Blobs at http://localhost:8888
```

Plain `pnpm dev` still serves the public site (falling back to
`data/members.json`), but the admin UI and the API need `pnpm dev:netlify`.

> **Netlify CLI on Node 25:** if `netlify dev` crashes with `fetch failed` while
> setting up the edge functions environment, run it under an LTS Node (for
> example `nvm use 20` — `nvm install 20` if missing). Deploys via
> `pnpm deploy` are unaffected.

## License

This project is licensed under the [MIT License](LICENSE).

---

Made with ❤️ by the #off-topic community
