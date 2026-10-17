## Design system — "Paper" (all front ends)

- Every website, web app, dashboard, admin panel or other browser front end I build
  or restyle uses my **Paper** design system. That covers new projects, new pages,
  new components and restyles of old projects.
- Animation is mandatory. Every page or component includes an entrance or scroll reveal, a state transition, hover and press feedback, and a section transition when the page has more than one region. Hero and login pages mount the Three.js scene (`data-scene="hero"`). A page shipped without animation does not follow the skill. `prefers-reduced-motion` switches to fades and opacity; it does not remove that feedback.
- Motion gap audit, before shipping: entrance or scroll reveal, state transition, hover and press feedback, section transition on multi-region pages, Three.js on hero and login, fades still present under reduced motion, alarms visible immediately.
- Load the `paper-design` skill (from the `paper-design` plugin) before writing any HTML/CSS/JSX, Tailwind classes,
  styling or Three.js visuals, and copy its `kit/` files instead of re-deriving them.
- Read and follow the skill's `GUIDELINES.md` (UI/UX Design Engineering Guidelines, v1.0,
  17 October 2026), including the motion mandate at the top. It is authoritative. Where it conflicts with this summary or older kit
  notes, the guidelines win. Do not invent colours, install a new motion library, or replace
  the kit with the guide's sample palette.
- The reference is my portfolio, https://yeems214.xyz (source:
  `/root/yeems214-website/rebuild-2/`). Match it when in doubt about material.
- In short: a paper `#f5f2eb` ground, ink `#1c1b18` text, one vermilion `#d2462f`
  accent, Instrument Serif + Inter + JetBrains Mono, solid sheets (no glass blur),
  16px body, 44px targets, mobile-first. Hero and login scenes keep moving while the tab is visible; other scenes sleep when idle. Reduced motion fades the canvas to a still frame. Scenes always degrade when WebGL is missing.
- Only deviate if I ask for a different look for a specific project. A client with a
  fixed brand keeps the Paper layout and type, with only the colours swapped.
