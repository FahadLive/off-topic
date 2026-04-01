# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**#off-topic** is a member directory for GEC Palakkad's tech community. It displays community members in two view modes: an interactive swipeable card stack and a filterable browse grid. Member data lives in `data/members.json`.

## Commands

- **Dev server:** `pnpm dev` (runs on http://localhost:5173)
- **Build:** `pnpm build` (outputs to `dist/`)

There are no tests or linting configured.

## Architecture

- **Stack:** React 18 + TypeScript, Vite, Tailwind CSS v4 (via `@tailwindcss/vite` plugin), Framer Motion (`motion/react`)
- **Path alias:** `@` maps to `./src` (configured in `vite.config.ts`)
- **Entry:** `src/main.tsx` → `src/app/App.tsx`
- **App.tsx** loads `data/members.json`, shuffles members once via `useMemo`, and renders either `CardStack` (swipe navigation) or `BrowseGrid` (filterable grid) based on a view toggle
- **MemberCard** (`src/app/components/MemberCard.tsx`) is the shared card component used by both views — styled as an ID card with lanyard hole, barcode footer, and social links
- **Member type** is defined in `src/types/data.ts`
- **UI primitives** in `src/app/components/ui/` are shadcn/ui + Radix components (mostly unused scaffolding)
- **Styles** are layered via `src/styles/index.css` which imports fonts, Tailwind, and theme CSS

## Data

Member data schema is in `data/members.json` with fields: `id`, `name`, `passoutYear`, `major`, `role`, `interests`, `color`, `image`, `bio`, `github`, `linkedin`, `twitter`. The `Member` type in `src/types/data.ts` must stay in sync with this schema.

## Key Details

- Tailwind v4 is configured via the Vite plugin, not PostCSS — `postcss.config.mjs` is intentionally empty
- The brand color is `#1b66f3` (used extensively as hardcoded values in components)
- Animations use `motion/react` (Framer Motion v12+), not the older `framer-motion` import
- `pnpm` is the preferred package manager (lockfile is `pnpm-lock.yaml`)
