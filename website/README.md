# EvalGate Website

The landing page and versioned documentation for EvalGate — the deterministic,
local-only evaluation tool for GitHub PR checks.

A **client-side SPA** built with Vite + React Router, **statically prerendered**
for SEO, and served by a **Cloudflare Worker** (assets-only, no server runtime).

## Stack

- **Vite 6** + **React 19** + **TypeScript**
- **React Router** for client-side routing
- **vite-react-ssg** to prerender every route to static HTML (hydrates into the SPA)
- **Tailwind CSS v4** (`@tailwindcss/vite`) + `@tailwindcss/typography`
- **Geist** fonts, self-hosted via `@fontsource-variable`
- **Cloudflare Workers** static assets for hosting

## How it works

Documentation lives as versioned markdown under `docs/<version>/*.md` (with
gray-matter frontmatter). A **build-time content pipeline**
(`scripts/build-content.ts`) renders each page to HTML using a unified
(remark/rehype/highlight.js) pipeline and emits static JSON + text into
`src/generated/` (gitignored) and `public/docs/`. The SPA imports those
artifacts, so the heavy markdown dependencies never reach the browser bundle.

Routes:

| Path | Renders |
| --- | --- |
| `/` | Landing page |
| `/docs` | Redirects to the latest version's default page |
| `/docs/:version` | That version's default doc page |
| `/docs/:version/:slug` | A documentation page |
| `/docs/:version/llm` | Combined plain-text "LLM View" (also raw at `/docs/:version/llm.txt`) |

## Getting started

```bash
npm install
npm run dev      # runs the content pipeline, then starts Vite on http://localhost:5173
```

Editing docs? Re-run `npm run build:content` (it also runs automatically before
`dev` and `build`).

## Build

```bash
npm run build    # content pipeline + vite-react-ssg prerender -> dist/
npm run preview  # preview the production build
```

## Deploy (Cloudflare Workers)

The site is served as static assets with SPA fallback (`wrangler.jsonc`).

```bash
npm run cf:dev   # local Cloudflare runtime (wrangler dev)
npm run deploy   # wrangler deploy
```

## Project structure

```
docs/                     # versioned markdown source (frontmatter-driven)
scripts/build-content.ts  # build-time markdown -> static JSON/text pipeline
src/
  content/                # client access layer over generated artifacts
  generated/              # build output (gitignored)
  lib/                    # markdown pipeline (build-only) + cn() util
  components/docs/        # DocLayout, VersionSelector, PreviousNext
  pages/                  # Home, DocPage, LlmView, DocsIndex, NotFound
  routes.tsx              # React Router route table + loaders + getStaticPaths
  main.tsx                # ViteReactSSG entry
index.html, vite.config.ts, wrangler.jsonc
```

## License

MIT © AOTP Ventures
