# YourFriend.Online

A production-oriented, frontend-only commercial landing site for **YourFriend**. The design is intentionally calm, positive, premium, and meditation-adjacent rather than dark SaaS/cyberpunk. It supports paired light/dark ambient environments, very slow hero rotation, optional live VRM rendering, responsive layouts, reduced-motion behavior, a demo-request flow, legal routes, and deployable static output.

## What is included

- React + Vite + TypeScript
- Light / dark / system theme control
- **Slow ambient scene slider** with five paired environments
- Clickable scene thumbnails and persistent **“Ambient scenes rotate slowly”** label
- Independent avatar layer (background and avatar do not rotate together)
- Optional Three.js + `@pixiv/three-vrm` live avatar renderer
- Commercial sections: Experiences, Presence, Privacy, Ambient Motion, final CTA
- Frontend-only demo form with optional endpoint or `mailto:` fallback
- Responsive mobile/tablet/desktop layout
- `prefers-reduced-motion` support
- Basic legal placeholders and SPA routing
- Vitest smoke tests
- Static deployment files (`_redirects`, robots, sitemap)

## Important: production media

This repository deliberately does **not** ship a third-party VRoid model, paid fonts, product footage, or AI-generated final commercial background art. It includes clean SVG scene placeholders so the site runs immediately.

Replace these with your licensed production assets:

```text
public/ambient/light/
public/ambient/dark/
public/avatar/models/companion.vrm
public/avatar/animations/
public/preview/
public/social/
```

The background images must contain **environment only** — no character, text, UI, logo, or baked buttons. The live/avatar layer is separate.

## Ambient scene design

The default slider order is:

1. Ocean
2. Mountain lake
3. Meditation garden
4. Coastal terrace
5. Open sky

Each scene has a light and dark pair. Automatic rotation is intentionally slow (24–28 seconds) with 3.4–3.8 second crossfades. User interaction pauses automatic rotation temporarily. Automatic changes stop for reduced-motion users and when the page is hidden.

Edit all scene assets/timing in:

```text
src/config/ambientScenes.ts
```

To move from SVG placeholders to WebP/AVIF, only update those image paths.

## Local development

```bash
npm install
cp .env.example .env
npm run dev
```

Build:

```bash
npm run build
```

The static site is written to `dist/`.

## Live VRM character

1. Put your licensed VRM in:

```text
public/avatar/models/companion.vrm
```

2. Set:

```bash
VITE_ENABLE_LIVE_VRM=true
```

3. Run the site.

The renderer includes transparent WebGL output, ACES tone mapping, hemisphere/key/rim lighting and a restrained procedural idle. For the commercial site, use only 3–5 curated ambient VRMA clips even if the product has a much larger motion library.

If the live model is disabled, the page uses the built-in stylized fallback so the layout remains complete.

## Demo request

Without a backend, the form uses `mailto:` to `VITE_SALES_EMAIL`.

For a real form service or your own API, set:

```bash
VITE_DEMO_ENDPOINT=https://example.com/api/demo-request
```

The endpoint should accept JSON:

```json
{
  "name": "...",
  "email": "...",
  "company": "...",
  "message": "..."
}
```

## Commercial launch checklist

Before going live:

- Replace placeholder scenes with licensed final art/video.
- Add the real VRM/VRMA assets and verify their commercial licenses.
- Replace PreviewModal placeholder with real product footage.
- Replace Privacy Policy and Terms with counsel-approved copy.
- Verify every privacy/security marketing claim against actual product behavior.
- Set real sales email and demo endpoint.
- Replace social preview placeholder.
- Add analytics only after consent/privacy decisions are complete.
- Run Lighthouse and real-device performance testing.
- Test Safari/iOS/Android, reduced-motion, keyboard navigation and WebGL failure fallback.

## Why the ambient engine is frontend-only

The commercial site does not need a backend to rotate environments. Scene order, light/dark assets and timings live in configuration. If you later want CMS/backend control, fetch the same scene schema at startup:

```ts
{
  id: string;
  label: string;
  lightImage: string;
  darkImage: string;
  duration: number;
  transitionDuration: number;
  focalPoint?: string;
}
```

The React component does not need to change.

## Deployment

### Cloudflare Pages / Netlify / Vercel

- Build command: `npm run build`
- Output directory: `dist`

The included `public/_redirects` supports SPA routes on compatible static hosts.

### Existing server

Serve `dist/` as static files and route unknown frontend paths back to `index.html`.

## Architecture

```text
Hero
├── AmbientSlider     (slow environment changes)
├── Hero wash         (text contrast)
├── HeroAvatar        (independent live/fallback character)
└── Hero copy/UI

Page
├── Experiences
├── Presence philosophy
├── Privacy
├── Motion system
├── Final CTA
└── Footer
```

The product application and commercial website stay deliberately separate. The marketing frontend does not implement chat, LLM APIs, voice recognition, memory storage, screen capture, HomePilot execution, or account auth.


## Design reference images

All visual generations are preserved under `docs/reference-images/`: older/background-only references remain in `background-library/` for future reuse, while newer companion-integrated versions live in `companion-integrated/`. New artwork should be appended rather than replacing older assets. The actual rotating hero backgrounds used by the frontend are the optimized files in `public/ambient/light/` and `public/ambient/dark/`.


Two additional companion-only concept artworks (light mountain interior and dark rooftop city night) were added under `docs/reference-images/companion-integrated/` and included in the ZIP.

### Vercel (marketing site)

1. Import this repository in Vercel and select the Vite framework preset.
2. Keep the build command as `npm run build` and output directory as `dist` (also declared in `vercel.json`).
3. Set `VITE_SITE_URL` to the final marketing-site URL, including its trailing slash. Leave `VITE_BASE_PATH` unset for a root-domain deployment.
4. Deploy. The included rewrite keeps direct SPA route refreshes working.

### GitHub Pages

1. In **Settings → Pages**, choose **GitHub Actions** as the source.
2. Push to `main` or run **Deploy marketing site to Pages** manually.
3. The workflow builds with `VITE_BASE_PATH=/yourfriend/` and deploys `dist` to `https://ruslanmv.github.io/yourfriend/`.

For a future custom domain, change `VITE_SITE_URL`, set `VITE_BASE_PATH=/`, and update `public/robots.txt` and `public/sitemap.xml` to the same canonical host.
