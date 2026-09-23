---
name: paper-design
description: The user's house design system ("Paper") — REQUIRED for every website, landing page, portfolio page, web app, dashboard, admin panel, internal tool or any other browser front end, whether new, being restyled, or getting a new page or component. Load it BEFORE writing or changing any HTML, CSS, JSX/TSX, Tailwind classes, component styling, colours, fonts, layout, or Three.js/WebGL visuals. Paper ground, ink type, one vermilion accent, Instrument Serif + Inter + JetBrains Mono, mobile-first, with high-fidelity Three.js scenes rendered onto the paper. Ships drop-in files (paper.css, tool.css, paper.js, scenes-kit.js, tailwind-preset.js, template.html).
---

# Paper — the house design system

Every browser front end the user builds follows this system: marketing sites and web tools alike.
The reference implementation is the live portfolio, **https://yeems214.xyz**, source at
`/root/yeems214-website/rebuild-2/`. When in doubt, open it and match it.

It overrides generic design defaults. Only deviate when the user asks for a specific look for a
specific project. A client brand whose colours are already fixed is the one standing exception:
keep the grammar below and swap only the palette tokens.

## The kit — copy, don't re-derive

`kit/` next to this file holds working files. Copy them into the project and build on them. Don't
re-type the tokens by hand.

| File | Use |
|---|---|
| `paper.css` | Tokens, base, paper grain, nav + mobile sheet, layout, type, buttons, cards, chips, status dots, frames, reveal, hero, stats, grid, CTA, footer |
| `tool.css` | Web apps: app shell + sidebar, panes, KPI tiles, toolbar, segmented control, tabs, forms, tables (stack to cards on phones), key/value, badges, banners, empty states, log, `<dialog>` (bottom sheet on phones), toasts, skeletons |
| `paper.js` | Nav sheet (Escape closes it, and crossing the breakpoint unlocks scroll), scroll reveals, counters, meters, footer year. No dependencies |
| `scenes-kit.js` | `mountScene(canvas, make)`: the Three.js paper runtime plus helpers (`paperMaterial`, `addLights`, `addGround`) and the reference `field` scene |
| `tailwind-preset.js` | The same tokens for Tailwind v3 projects (v4: map the `:root` block under `@theme`) |
| `template.html` | A complete starter page in the correct structure |

In React/Vue/Svelte projects, import `paper.css` (and `tool.css`) once at the root and use the class
names. Or use the Tailwind preset with the same values. Don't fork the palette into a JS theme
object that can drift.

## Tokens (never invent new colours)

| Token | Value | Role |
|---|---|---|
| `--paper` | `#f5f2eb` | Page ground. `body` and every WebGL clear colour use it |
| `--paper-hi` / `--paper-lo` | `#faf8f3` / `#ebe6db` | Raised surfaces / recessed fills |
| `--ink` | `#1c1b18` | Text, primary buttons, selected states |
| `--ink-2` / `--ink-3` | `#4f4b43` / `#8a857a` | Body copy / labels and meta |
| `--line` / `--line-2` | ink at 12% / 22% | Hairlines, borders |
| `--accent` | `#d2462f` vermilion | The ONE accent: italic emphasis, a few objects per scene, current-page dot, focus ring |
| `--ok` `--warn` `--err` `--down` | `#3d7a57` `#c68a17` `#d2462f` `#b5afa3` | Health / status only — never decoration |

Radius 18px (cards), 12px (inputs, small panels), 999px (buttons, chips). Easing
`cubic-bezier(.2,.7,.2,1)`. Gutter `clamp(20px, 5vw, 56px)`, content max 1200px. Light only:
there is no dark mode unless the user asks for one.

## Type

- **Instrument Serif** (400, italic) for display and headings. `.display` for heroes, `.h2`, `.h3`.
  Put the accent in the headline as an `<em>`: *"Project <em>index</em>"*. One accent phrase per
  heading, at most.
- **Inter** (400/500/600) for text. Body 17px / 1.6; `.lead` for intro paragraphs (max ~62ch).
- **JetBrains Mono** only for small uppercase labels: `.eyebrow`, meta rows, chips, table headers,
  KPI labels. Never for paragraphs.
- Sentence case everywhere. No ALL-CAPS headings, no terminal-cosplay copy (`// SYS_STATUS`,
  `ROOT_ACCESS`). Mono labels are the only uppercase.

## Layout and components

- The page is paper, not a dark void. Cards are *translucent paper* (`rgba(250,248,243,.74)` +
  backdrop blur + a 1px hairline), so the 3D layer shows through as texture.
- Section rhythm: `.eyebrow` → `.h2` → `.lead`, often split into two columns with
  `.section-head--split`. Generous vertical space (`.section`).
- Buttons: `.btn` (outlined pill), `.btn--ink` (solid primary), `.btn--lg`, and a trailing
  `<span class="arrow">→</span>` that nudges on hover. Text links use `.link` (an underline hairline).
- Status is a 7px dot (`.dot--ok|warn|err|live`) plus words, never colour alone.
- Photos go in `.frame`, slightly desaturated and restored on hover.
- Minimal means fewer elements, not smaller ones. No gradients or glows, no shadows beyond the
  single soft dialog/toast shadow, no emoji icons, no custom cursors, and no preloaders.

## Mobile — design it first

- Test at **360px and 390px wide**. There must be no horizontal page scroll; check
  `scrollWidth > innerWidth`.
- Below 900px the nav becomes the full-height sheet from `paper.css`/`paper.js`.
- Tap targets ≥ 44px, and form inputs are 16px so iOS doesn't zoom on focus.
- Wide things (tables, step rows) scroll inside their own container or stack; the page never
  scrolls sideways.
- Heroes that own a 3D scene get `.page-hero--stage` so the model has a clear band below the copy on
  phones.

## Three.js — high fidelity, always on paper

Every site gets a 3D layer unless the user says otherwise; tools get it where it explains something
(a topology, a model, a map), not as wallpaper behind forms.

- **Render onto the paper.** `setClearColor(PAPER)`, `scene.background = PAPER`,
  `Fog(PAPER, …)`, `NeutralToneMapping`, sRGB output. The canvas must have no visible edge.
- **Materials:** `MeshPhysicalMaterial` (light clearcoat + sheen) lit by a `RoomEnvironment`
  PMREM. Mostly paper-white and warm-grey objects, a few ink ones, and ~1–3% vermilion.
  White-on-white gets its depth from a strong key light and **soft shadows onto a `ShadowMaterial`
  ground**, not from outlines.
- **Motion** is slow and physical: waves, drift, orbit, scroll-driven camera moves, a pointer
  ripple. Nothing flashes. Scroll progress (`state.hp` hero, `state.sp` page) drives the story.
- **Composition:** on desktop the object sits beside the copy, not behind it. On phones it goes in
  the band below the hero text, and the background dims as you scroll past the hero. Text must
  never sit on a busy part of the scene.
- **Degrade, always** (all built into `mountScene`):
  - No WebGL → the canvas stays hidden and the page is complete.
  - Phones, coarse pointers and ≤4 cores → standard material, 1024 shadow maps, fewer instances,
    DPR ≤ 1.5.
  - A quality ladder steps down only while that actually helps.
  - `prefers-reduced-motion` → time stops; honour it live.
  - Hidden tab or faded canvas → the loop sleeps.
  - Two WebGL contexts must never both render on one screen.
- **Delivery:** vendor Three.js with the project (a `vendor/three/` directory, or npm with a
  bundler). No CDN importmaps: they force `script-src 'unsafe-inline'`.
- One module per page scene, and the canvas is `aria-hidden`. Anything the scene shows that matters
  is also said in text.

## Accessibility and security baseline

- A skip link, a real `<nav>`, `aria-current="page"`, a visible vermilion focus ring, a
  `role="status"` live region for things that change, and `aria-pressed`/`aria-selected` on
  toggles and tabs.
- Content is visible without JS: reveals only hide elements once `html.js` is set.
- No inline `<script>`; aim for a `script-src 'self'` CSP. Short `style="--d:.06s"` reveal delays
  are fine, since `style-src 'unsafe-inline'` is acceptable.

## Restyling an existing project

1. Copy `paper.css` (+ `tool.css` for apps) and the fonts in; delete the old palette and font
   imports, and remove the old dark/neon tokens rather than aliasing them.
2. Map the old components onto the kit's classes, or restyle the components to the kit's rules.
   Keep behaviour, IDs and data hooks untouched.
3. Replace decorative effects (glows, scanlines, custom cursors, preloaders, typewriters) with
   nothing, or with a paper Three.js scene.
4. Check at 360/390/1280px: no horizontal scroll, no console errors, and it still works with JS or
   WebGL disabled.
