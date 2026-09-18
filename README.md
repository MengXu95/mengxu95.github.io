# Meng Xu — Academic Homepage

This repository contains a custom academic website for Meng Xu (许萌). It uses Jekyll only as a static-site generator; the theme, layouts, components, styles, interactions, and content structure are maintained in this repository.

## Structure

- `content` — published page content and URL metadata
- `components/layouts` — custom page shells
- `components/includes` — reusable navigation, profile, footer, and climbing game
- `styles` — source SCSS
- `scripts` — browser interactions
- `assets` — generated stylesheet, portrait, and favicon
- `tools` — repository checks

## Local development

```powershell
bundle install
bundle exec jekyll serve --livereload
```

Then open `http://127.0.0.1:4000`.

Run repository checks with:

```powershell
npm run check
```

If Ruby is unavailable, a zero-dependency structural preview can be rendered to the ignored `site` directory with `npm run preview`. Jekyll remains the production build.

For browser regression checks:

```powershell
npm install
npm run check:game
```

The tests use headless Microsoft Edge on Windows. On other platforms, install Chromium with `npx playwright install chromium`, or set `PLAYWRIGHT_CHANNEL` to an installed browser channel. The tests start their own temporary server, exercise desktop and mobile layouts, and mock every optional counter request. They never increase a real shared total.

## Climbing game

The numbered route has eight deterministic moves and retains the original seven-color hold palette. Route holds have white tape and move numbers. Only reaching the final hold records an ascent. Resetting, choosing an off-route hold, or repeating a click after completion does not add another ascent. Keyboard play supports Tab, Enter, and Space, with focus following the active hold. Reduced-motion preferences disable animations.

The default counter records completed ascents in this browser, not unique people or a global rank. It persists under `mx-climb-5-12c-sends-v2` in local storage and falls back to a labelled session count when storage is unavailable. Clearing browser data clears the local record. Cross-tab increments use Web Locks when supported. The old cached rank is intentionally not migrated because it mixed local fallback values with remote values.

The former CounterAPI v1 service was retired on August 7, 2026 and returns HTTP 410. No replacement cloud service is configured. An optional public endpoint can be supplied through `data-climb-counter-url` in `components/includes/climbing-game.html`. It must accept an increment request over GET and return JSON with a positive integer `count` (or `value`), with CORS enabled when needed. Use an endpoint under your control; never put private API keys in the static site. Requests time out after 1.8 seconds, are not retried automatically, and do not substitute a local value for a shared one. A shared response is presented as a total, never a unique-person ranking.

The homepage retains its original layout and typography. Only the climbing game uses self-hosted Source Sans 3 and Lucide control icons. Their licenses are retained in `assets/source-sans-3.LICENSE.txt` and `assets/lucide.LICENSE.txt`. The climbing character and wall are inline SVG, with hold-relative limb positions and a rope-catch animation.

## Recovery point

The annotated Git tag `stable-jekyll-2026-07-13` preserves the last stable version before the previous site structure was replaced.
