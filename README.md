# Narrative Nexus

A Vite + React + TypeScript app with a writing interface inspired by your mockup (Lore panel, Zen Canvas editor, soul-check slider, and generate control).

## Tech Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- Framer Motion

## Local Development

```sh
npm install
npm run dev
```

## Production Build

```sh
npm run build
npm run preview
```

## Deploy To Vercel

This repository is configured for Vercel with `vercel.json`.

```sh
npx vercel
```

For production deployment:

```sh
npx vercel --prod
```

Vercel will:

- run `npm run build`
- serve `dist`
- rewrite SPA routes to `index.html`
