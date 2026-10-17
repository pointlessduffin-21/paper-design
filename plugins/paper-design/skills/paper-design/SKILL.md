---
name: paper-design
description: The user's house design system ("Paper") — REQUIRED for every website, landing page, portfolio page, web app, dashboard, admin panel, internal tool or any other browser front end, whether new, being restyled, or getting a new page or component. Load it BEFORE writing or changing any HTML, CSS, JSX/TSX, Tailwind classes, component styling, colours, fonts, layout, or Three.js/WebGL visuals. Animation is mandatory: entrance or scroll reveals, state transitions, hover and press feedback, section transitions, and a Three.js scene on hero and login pages. A page shipped without animation does not follow the skill. Reduced motion keeps fades and opacity. Read GUIDELINES.md (next to this file) and follow it; it is the authoritative UI/UX design-engineering ruleset and wins on conflict. Then copy the kit (paper.css, tool.css, paper.js, scenes-kit.js, tailwind-preset.js, template.html, login.html) instead of re-deriving tokens.
---

# Paper — the house design system

Every browser front end follows this system: marketing sites and web tools alike.
The reference implementation is the live portfolio, **https://yeems214.xyz**, source at
`/root/yeems214-website/rebuild-2/`. When in doubt about material, open it and match it.

**Before writing UI, read [`GUIDELINES.md`](GUIDELINES.md) in this directory and follow it.**
It is the UI/UX Design Engineering Guidelines for paper-design, v1.0, 17 October 2026,
written from the user's 31 principles. It overrides this file and the older kit notes
wherever they disagree. This file is how those rules map onto the existing kit.
Do not replace the kit with the guide's example palette, React snippets, or a new
animation library. Copy the kit and extend it.

It overrides generic design defaults. Only deviate when the user asks for a specific look for a
specific project. A client brand whose colours are already fixed is the one standing exception:
keep the grammar below and swap only the palette tokens.

Run `node --test scripts/check-kit.mjs` from the paper-design repo after changing the kit.

## Reconciliation (guide wins, identity stays)

The guide's §6 sample colours (`#eee9df`, `#165b91`, 4px radius) are examples to reconcile,
not a new brand. This kit keeps the established Paper identity and applies the guide's
behaviour on top:

| Kept | Why |
|---|---|
| `--paper #f5f2eb`, `--ink #1c1b18`, `--accent #d2462f` | Established palette. Accent is 4.03:1 on paper: fine for large italic and the 3px focus ring, not for small text. |
| Radii 18px / 12px / pill buttons | Established controls. The guide's 4px sample is not installed. |
| Instrument Serif, Inter, JetBrains Mono | Unchanged. |
| Marketing `.display` scale | Sites still use the large serif hero. Operational routes use `.app__title`, not `.display`. |
| Desktop WebGL DPR cap 2, phones 1.5 | The quality ladder steps down when frames stay slower than 33ms for 2s. |

| Changed, because the guide conflicts | What shipped |
|---|---|
| Frosted glass / `backdrop-filter` | Solid `--paper` / `--paper-hi` sheets. Blur is gone. |
| Body 17px / 1.6 | 16px / 1.5. Inputs stay 16px. |
| Reveals and reduced motion removed animation | Animation is mandatory. See Motion below. Reduced motion fades; it does not set `animation: none`. |
| Number counters tweened through fake values | The authored number stays. Do not invent intermediate readings. |
| Live-dot pulse | Static dot plus words. No continuous status pulse. |
| `--ink-3 #8a857a` (3.29:1) | `#6b675f`, same hue, 4.5:1 on paper-lo. |
| `--ok #3d7a57`, `--warn #c68a17`, `--err #d2462f` as small text | `#397352`, `#896010`, `#b83d29`. Same hues, darkened to 4.5:1. `--accent` stays `#d2462f`. |
| `--down #b5afa3` (1.95:1) | `#88837a`, 3:1 as a non-text mark. |
| 36px tool buttons | Standalone controls are at least 44px, 48px on coarse pointers. |
| Sidebar `display: none` below 1000px | The sidebar stacks in document order on narrow screens. |
| Scene loop ran forever | Hero and login (`data-scene="hero"`) keep moving while the tab is visible. Other scenes sleep 1.2s after the last scroll or pointer move. Reduced motion fades the canvas in and holds a still frame. `dispose()` releases the context. A second WebGL context is refused. |

Muted labels, status text, and control edges were darkened only as far as WCAG 2.2 AA contrast required. No new hues were added.

## The kit — copy, don't re-derive

`kit/` next to this file holds working files. Copy them into the project and build on them. Don't
re-type the tokens by hand.

| File | Use |
|---|---|
| `GUIDELINES.md` | Authoritative rules. Read before implementing. Not copied into every site. |
| `paper.css` | Tokens, base, static paper grain, nav + mobile sheet, layout, type, buttons, cards, chips, status dots, frames, hero, stats, grid, CTA, footer, reduced motion, forced colors, print |
| `tool.css` | Web apps: app shell + sidebar, workspace/inspector, panes, metrics, toolbar, segmented control, tabs, forms, tables (stack to cards on phones), key/value, badges, banners, receipts, empty states, log, `<dialog>` (bottom sheet on phones), toasts, skeletons |
| `paper.js` | Nav sheet (Escape, focus trap, inert page, breakpoint unlocks scroll), mandatory motion helpers (`paper.enter`, `paper.reveal`, `paper.section`, `paper.setState`), stagger cap, reduced-motion and reduced-effects settings, dialog focus return, form errors, truthful sort, tabs, footer year. No dependencies |
| `paper-policy.mjs` | Tested motion, stagger, phase-label, and strict numeric sort helpers. `paper.js` mirrors the marked functions |
| `scenes-kit.js` | `mountScene(canvas, make)`: the Three.js paper runtime plus helpers (`paperMaterial`, `addLights`, `addGround`) and the reference `field` scene. Returns `{ dispose, wake }`. Three.js is vendored in `vendor/` |
| `tailwind-preset.js` | The same tokens for Tailwind v3 projects (v4: map the `:root` block under `@theme`) |
| `template.html` | Marketing starter. Entrance, section, hover/press, nav state, and the hero scene are already on |
| `login.html` | Sign-in starter with the same motion, plus a password-visibility state, and `data-scene="hero"` |
| `main.js` | Mounts the field scene for `template.html` and `login.html` |
| `fixture.html` | Operational ledger fixture: queue, inspector, dialog, draft, receipt. The critical queue is not held for an entrance |
| `vendor/` | Three.js r0.170.0 (`three.module.min.js`) plus the two addons the field scene uses. MIT |

In React/Vue/Svelte projects, import `paper.css` (and `tool.css`) once at the root and use the class
names. Or use the Tailwind preset with the same values. Don't fork the palette into a JS theme
object that can drift.

## Tokens (never invent new colours)

| Token | Value | Role |
|---|---|---|
| `--paper` | `#f5f2eb` | Page ground. `body` and every WebGL clear colour use it |
| `--paper-hi` / `--paper-lo` | `#faf8f3` / `#ebe6db` | Raised sheets / recessed fills |
| `--ink` | `#1c1b18` | Text, primary buttons, selected states |
| `--ink-2` / `--ink-3` | `#4f4b43` / `#6b675f` | Body copy / labels and meta. `--ink-3` must stay ≥4.5:1 |
| `--line` / `--line-2` | ink at 12% / 22% | Decorative hairlines only |
| `--line-strong` | ink at 55% | Boundaries of inputs and other controls (≥3:1) |
| `--accent` | `#d2462f` vermilion | The ONE accent: large italic emphasis, a few objects per scene, current-page dot, focus ring. Not small body text |
| `--ok` `--warn` `--err` `--down` | `#397352` `#896010` `#b83d29` `#88837a` | Status only — never decoration. Pair with text, never colour alone |

Spacing scale: 4, 8, 12, 16, 24, 32, 48px (`--space-1` … `--space-7`). Gaps inside a group are smaller than gaps between groups.

Radius 18px (cards), 12px (inputs, small panels), 999px (buttons, chips). Entry ease
`cubic-bezier(.2,.8,.2,1)` (`--ease-enter`), state ease `cubic-bezier(.4,0,.2,1)` (`--ease-state`).
Durations: press 120ms, state 160ms, entrance 480ms, section 560ms. Never `transition: all`.
Light only: there is no dark mode unless the user asks for one.

## Type

- **Instrument Serif** (400, italic) for display and headings. `.display` for marketing heroes, `.h2`, `.h3`. Operational screens use `.app__title`.
  Put the accent in the headline as an `<em>`: *"Project <em>index</em>"*. One accent phrase per
  heading, at most. Accent italic is large text; do not use `--accent` for 13px labels.
- **Inter** (400/500/600) for text. Body 16px / 1.5; `.lead` for intro paragraphs (max ~62ch).
- **JetBrains Mono** only for small uppercase labels: `.eyebrow`, meta rows, chips, table headers,
  KPI labels. Identifiers may use mono as well. Never for paragraphs.
- Comparable readings use `.reading` or `.num` (tabular numerals). Never truncate a unit, minus sign, threshold, severity, or command target.
- Sentence case everywhere. No ALL-CAPS headings, no terminal-cosplay copy (`// SYS_STATUS`,
  `ROOT_ACCESS`). Mono labels are the only uppercase.

## Layout and components

- The page is paper, not a dark void. Cards and panes are **opaque paper sheets** with a 1px hairline. Do not add `backdrop-filter`, frosted glass, neon, or gradients.
- Section rhythm: `.eyebrow` → `.h2` → `.lead`, often split into two columns with
  `.section-head--split`. Generous vertical space (`.section`).
- Buttons: `.btn` (outlined pill, ≥44px), `.btn--ink` (the one primary), `.btn--lg`, and a trailing
  `<span class="arrow">→</span>` that nudges 3px. Text links use `.link`. A disabled control stays
  focusable when it uses `aria-disabled`, and a nearby `.disabled-reason` says why.
- Status is a dot (`.dot--ok|warn|err|down`) **plus words**, never colour alone. Critical copy uses `.status-critical` and the word Critical. Do not pulse it.
- Photos go in `.frame`. No hover zoom.
- Minimal means fewer elements, not smaller ones. No gradients or glows, no shadows beyond the
  single soft dialog/toast shadow, no emoji icons, no custom cursors, and no preloaders.
- Tool screens: global context, then the queue, then evidence, then an explicit `.action-rule`.
  `.workspace` stacks the inspector under the list below 60rem. `.metric` keeps label, value, unit, and freshness together. `.receipt` holds the outcome, including partial failure. A `.toast` cannot be the only record.
- Command copy comes from `paper.phaseLabel`: Requesting, Request accepted; verification pending, Verified, Failed, Unknown outcome. Do not show success because a request was sent.
- `<details class="disclosure">` for secondary detail. Critical facts stay outside it.
- Grain is a static `body::after`, behind the type, `pointer-events: none`, removed in print and when `data-paper-effects="reduce"`.

## Motion

**Animation is mandatory.** A page or component shipped without it does not follow the skill. This matches the motion mandate at the top of `GUIDELINES.md` and overrides any older line that called motion optional or turned it off under reduced motion.

Every page includes:

- an entrance or scroll reveal
- a state transition
- hover and press feedback
- a section transition when the page has more than one region
- the Three.js scene on hero and login pages

Drop-in helpers on `window.paper` after `paper.js` loads:

```js
paper.enter(el);          // play the entrance now
paper.reveal(el);         // same fade for a node that just appeared
paper.section(el);        // data-section, longer fade
paper.setState(el, 'on'); // data-state, color/opacity transition
```

Markup the kit already plays: `data-enter` (on load), `data-reveal` (on scroll), `data-section` (longer scroll fade), `data-paper-state` (toggles `data-state`; `data-paper-state="password"` also shows the controlled field). `data-motion="off"` opts a subtree out. Alarms (`.status-critical`, `.banner`, `[role="alert"]`) are never held at opacity 0.

- Local acknowledgement is immediate: `data-paper-ack="Requesting"` or `paper.acknowledge(button)`.
- `data-paper-once` ignores a second activation while `aria-busy` is set.
- Stagger at most the first six items, 40ms apart, 240ms cap. `paper.js` caps authored `--d` delays.
- Hover and press use color, border, or opacity (`--dur-press` 120ms). The arrow nudge is `--paper-nudge` (3px) and becomes 0 under reduced motion. Press does not move the hit target.
- `prefers-reduced-motion: reduce` and `[data-paper-reduce-motion]` keep the fades and opacity feedback. They set `--paper-shift` and `--paper-nudge` to 0. They do not set `animation: none`.
- An in-app control `[data-paper-reduce-motion]` sets `data-paper-motion="reduce"` and `localStorage` key `paper-reduce-motion`. It can strengthen the OS setting. It cannot turn motion back on while the OS asks for less. `[data-paper-reduce-effects]` is separate (`paper-reduce-effects`) and hides grain and the canvas.
- Query `?motion=reduce` and `?effects=reduce` apply for that load.
- One polite live region, `#paper-status`. Do not put `aria-live` on a fast table.
- Hero and login canvases use `data-scene="hero"` so the field keeps moving while the tab is visible. Other scenes sleep 1.2s after the last scroll or pointer move. Reduced motion fades the canvas in, then holds a still frame. Do not add a spring library for a hover.

### Motion gap audit

Before shipping, confirm each item that applies. A miss means the page does not follow the skill.

- Entrance or scroll reveal is present.
- A state transition is present (sheet, dialog, disclosure, or `data-paper-state`).
- Controls change color, border, or opacity on hover and press.
- A multi-region page has a section transition.
- Hero and login pages mount `<canvas data-scene="hero">`.
- With reduced motion on, entrances still fade and presses still change opacity or color.
- Alarms are visible immediately, including with JavaScript off.

## Mobile — design it first

- Test at **320, 390, 768, 1280, and 1920px**. There must be no horizontal page scroll. Wide tables scroll inside `.table-wrap` (give it `tabindex="0"` and an accessible name) or use `.table--stack` with `data-label` on each cell.
- Below 900px the marketing nav becomes the full-height sheet from `paper.css`/`paper.js` (focus trap, Escape, inert `main`/`footer`).
- Below 1000px the app sidebar is in normal flow, not removed.
- Tap targets ≥ 44px (48px for coarse pointers). Form inputs are 16px so iOS doesn't zoom on focus.
- Heroes that own a 3D scene get `.page-hero--stage` so the model has a clear band below the copy on phones.
- One DOM order at every width. Do not reorder with `order` in a way that makes keyboard focus jump.

## Three.js — high fidelity, always on paper

Every marketing site gets a 3D layer unless the user says otherwise; tools get it where it explains something
(a topology, a model, a map), not as wallpaper behind forms. The canvas is `aria-hidden` and decorative. Anything that matters is also in the DOM. Mesh picking selects an id; it does not dispatch a physical command.

- **Render onto the paper.** `setClearColor(PAPER)`, `scene.background = PAPER`,
  `Fog(PAPER, …)`, `NeutralToneMapping`, sRGB output. The canvas must have no visible edge.
- **Materials:** `MeshPhysicalMaterial` (light clearcoat + sheen) lit by a `RoomEnvironment`
  PMREM. Mostly paper-white and warm-grey objects, a few ink ones, and ~1–3% vermilion.
  White-on-white gets its depth from a strong key light and **soft shadows onto a `ShadowMaterial`
  ground**, not from outlines.
- **Motion** on hero and login scenes (`data-scene="hero"`) continues while the tab is visible. Every other scene moves while someone is scrolling or moving the pointer, then the loop sleeps. Nothing flashes. Scroll progress (`state.hp` hero, `state.sp` page) may ease the camera. Do not capture the wheel.
- **Composition:** on desktop the object sits beside the copy, not behind it. On phones it goes in
  the band below the hero text, and the background dims as you scroll past the hero. Text must
  never sit on a busy part of the scene.
- **Degrade, always** (built into `mountScene`):
  - No WebGL, or a lost context → the canvas stays hidden, `data-scene-state="unavailable"`, and `[data-scene-fallback]` is shown if present. The page is complete.
  - Phones, coarse pointers and ≤4 cores → standard material, 1024 shadow maps, fewer instances, DPR ≤ 1.5.
  - A quality ladder steps down when mean frame time exceeds 33ms across a 2s window, and stops if a cut does not help. `data-scene-quality` becomes `reduced` or `minimal`.
  - `prefers-reduced-motion` or `data-paper-motion="reduce"` → scene time stops and the canvas fades to a still frame. Page motion keeps its fades. Honour both live.
  - `data-paper-effects="reduce"` → canvas hidden, shadows off, loop stopped.
  - Hidden tab or faded canvas → the loop sleeps. Frame deltas are clamped to 50ms.
  - Two WebGL contexts must never both render. The second `mountScene` call is skipped.
  - Call `dispose()` on unmount.
- **Delivery:** Three.js is already vendored in `kit/vendor/` (`three.module.min.js`, MIT, plus `RoomEnvironment.js` and `RoundedBoxGeometry.js`). `scenes-kit.js` imports those relative paths. No CDN import map.
- One module per page scene.

## Accessibility and security baseline

Target WCAG 2.2 AA. The kit is not a conformance claim.

- A skip link, a real `<nav>`, `aria-current="page"`, a visible vermilion focus ring (3px), `scroll-padding-top` / `scroll-margin-top`, and no positive `tabindex`.
- `#paper-status` (`role="status"`) for short announcements. `paper.announce(message, id)` dedupes for one second.
- `paper.js` returns focus to the dialog opener and moves initial focus to `[data-paper-initial-focus]` or the heading, not the confirm button.
- Forms use visible labels, `.hint`, `.error` referenced by `aria-describedby`, and `.error-summary`. `data-paper-form` focuses the summary on an invalid submit. `data-paper-local` saves a draft note on the page and announces that nothing was sent.
- Tables that sort use `data-paper-sort` and `data-value`. Missing numbers sort last. They are not treated as zero.
- Forced colors and print keep text, drop grain, nav, and the scene. Print keeps evidence.
- Content is visible without JS.
- No inline `<script>`; aim for a `script-src 'self'` CSP. Short `style="--d:30ms"` delays are fine.

## Restyling an existing project

1. Copy `paper.css` (+ `tool.css` for apps) and the fonts in; delete the old palette and font
   imports, and remove the old dark/neon tokens rather than aliasing them.
2. Map the old components onto the kit's classes, or restyle the components to the kit's rules.
   Keep behaviour, IDs and data hooks untouched.
3. Replace decorative effects (glows, scanlines, custom cursors, preloaders, typewriters, glass blur) with the required Paper motion: entrances, state, hover/press, section transitions, and a paper Three.js scene on hero and login pages. Non-hero scenes sleep when idle.
4. Check at 320/390/1280px with keyboard only, with reduced motion, and with JS or WebGL disabled: no horizontal scroll and no console errors.

## What this kit does not pretend to be

These stay in `GUIDELINES.md` as rules for the product that uses the kit. They are not faked here:

- Server command reconciliation, interlocks, authorization, and idempotency. The phase labels exist so UI copy stays honest; there is no backend.
- A pressure parser with equipment limits. Sorting uses a strict number parse so `12abc` and blank cells are missing, not numbers. Real limits come from the equipment spec.
- Virtualizing 10,000 rows, Playwright, axe, or a certified WCAG audit.
- A digital-twin graph. `scenes-kit.js` is a paper background. A twin still needs a DOM list of the same asset ids.
- The Motion library and spring presets. CSS and the existing renderer are enough.
