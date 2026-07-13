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

## Recovery point

The annotated Git tag `stable-jekyll-2026-07-13` preserves the last stable version before the previous site structure was replaced.
