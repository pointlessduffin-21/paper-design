# Guidelines gap audit

Checked 17 October 2026 against the kit in this directory, not against the wording of `GUIDELINES.md` alone. A row is **implemented** only when the kit's code, template, or fixture actually does the thing. A mention in a doc is not evidence.

Statuses: **implemented**, **partial**, **doc-only**, **missing**.

The guide's server, safety-system, and lab-study requirements stay doc-only on purpose. This repository is a design-system kit, not a plant backend.

| # | Principle | Status | Evidence | Still missing |
|---|---|---|---|---|
| 01 | Hick's Law | partial | `kit/fixture.html` one ink primary (Inspect) and a disabled Isolate with a reason. `kit/template.html` one primary and one secondary. Preset group is three named views. | No searchable secondary menu. No 100-asset timing study. |
| 02 | Miller's Law | partial | Asset id stays in the fixture title, inspector, and fieldset. Readings carry units. `kit/tool.css` `.metric` keeps label, value, unit, and freshness together. | No multi-step calibration that proves a value never has to be memorised between routes. |
| 03 | Paradox of Choice | partial | `kit/fixture.html` views All / Needs attention / Running, each with a one-line purpose in `#preset-note`. `kit/paper.js` `applyPreset`. Sort remains available. | No export-scope presets. No proof that custom configuration is at most two activations beyond this fixture. |
| 04 | Occam's Razor | implemented | The ledger is a table. The scene is `aria-hidden` and never the only reading. `kit/paper.css` has no `backdrop-filter`. Exact values stay in the DOM. | Each future component still has to justify itself. This row is about the kit, not every future page. |
| 05 | Pareto Principle | partial | The queue is the first pane and uses the page title. Isolate stays on screen, disabled, with a reason. | No observed task-frequency evidence. No named release test of a rare high-consequence scenario beyond the disabled control. |
| 06 | Cognitive Load Theory | partial | Units on pressures, a source time, and a margin note for the 5–7 bar range in `kit/fixture.html`. Body copy is 16px / 1.5 in `kit/paper.css`. | Abbreviations are not given expansions. No single-route diagnosis study. |
| 07 | Goal-Gradient Effect | implemented | Fixture progress is a determinate `<progress value="3" max="5">` plus the sentence that safety verification is still required. | Unknown-length work has no indeterminate example in the fixture. |
| 08 | Parkinson's Law | partial | `data-paper-local` saves a draft on the page. No countdown and no speed incentive. | No reusable calibration profile. No session-expiry recovery. |
| 09 | Peak-End Rule | partial | `.receipt` in `kit/fixture.html` says 18 succeeded and 2 failed, and names P-077 as the retry. `paper.phaseLabel` will not call an accepted request verified. | Receipts are not reconciled with a server. |
| 10 | Serial Position Effect | implemented | The fixture title is the asset. The calibration action rule is at the end of the form. The critical row is in the queue, not buried under the submit button. | — |
| 11 | Zeigarnik Effect | partial | Banner: draft saved, production unchanged. `data-paper-persist` restores the calibration draft from `sessionStorage` on reload and Discard clears only that draft. Passwords are not stored. | Not synced across devices. A draft cannot deploy because nothing is sent, which is as far as a static kit can go. |
| 12 | Fitts's Law | implemented | `kit/paper.css` standalone controls are at least 44px, 48px for coarse pointers. Dialogs and the nav sheet are real buttons. Actions are not hover-only. | No lab measurement of pointing time. |
| 13 | Doherty Threshold | partial | `data-paper-ack` writes “Requesting” in the same click. `kit/scenes-kit.js` keeps WebGL off the DOM thread's layout, and frame deltas clamp at 50ms. | No 5-second delay harness and no abortable search. |
| 14 | Tesler's Law | doc-only | Advanced diagnostics sit in `<details>` so the formula would have a place. `GUIDELINES.md` §7 states the rule. | No derived value with a visible formula, no authorised override, no server rejection. |
| 15 | Postel's Law | partial | `parseStrictNumber` in `kit/paper.js` and `kit/paper-policy.mjs` rejects `12abc`, `1,500`, and blanks. Optional units are split off the first token. `scripts/check-kit.mjs` locks this. | No date normalisation, no import review column beside the original text. |
| 16 | Jakob's Law | partial | Links navigate and buttons act. Escape closes the nav sheet and the dialog and returns focus. `kit/paper.js`. | No client router, so browser Back is just the browser. No documented exception list for domain shortcuts. |
| 17 | Progressive Disclosure | implemented | `<details class="disclosure">` in the fixture. Severity and freshness stay outside it. Native details open with Enter, Space, and touch. | Open sections are not remembered per task. |
| 18 | Gestalt Proximity | implemented | `.metric` wraps label, value, unit, and freshness. Field errors use `aria-describedby` on the same field. Spacing scale is in `kit/paper.css`. | — |
| 19 | Gestalt Similarity | partial | `.badge`, `.dot`, and `.status-critical` share one grammar in `kit/tool.css` and `kit/paper.css`. Status is a word plus a mark. | No shared icon set, chart series, or twin material encoding. |
| 20 | Gestalt Closure | partial | The P-077 pressure cell says Unavailable and sorts last, not as zero. `compareCell` in `kit/paper-policy.mjs`. | No sparkline that leaves a gap for missing samples. |
| 21 | Gestalt Continuity | doc-only | `GUIDELINES.md` §3.21 and §7. The inspector does not change selection. | No drill-down, no restored scroll, no route state. |
| 22 | Von Restorff Effect | implemented | Only the failing pump uses `.status-critical`. The live-dot pulse is gone. Routine badges are quiet. | The hero scene does not pause because an alarm exists; the ledger has no scene. |
| 23 | Aesthetic-Usability Effect | partial | `data-paper-effects="reduce"` hides grain and the canvas. Contrast floors are asserted in `scripts/check-kit.mjs`. Errors stay on the form. | No task-completion study with effects off. Visual polish is not treated as evidence. |
| 24 | Law of Prägnanz | implemented | The inspector lists Process, Telemetry, and Command as separate rows, including when they disagree. Tokens live in one `:root`. | — |
| 25 | Gestalt Common Region | implemented | Panes and the fieldset “P-204 measurement” name their scope. The review dialog says the target stays P-204. | Batch scope is described in the receipt, not chosen from a live selection set. |
| 26 | Gestalt Uniform Connectedness | partial | The fixture relationship list states the P-118 → P-204 edge as verified and P-077 as disconnected. No decorative lines. | No drawn connector, because a line without a matching DOM edge would invent a relationship. There is no graph source. |
| 27 | Affordance | implemented | Controls are buttons and links. `.card` does not set a pointer cursor. The canvas is `aria-hidden`. `kit/paper.css`, `kit/template.html`. | No drag handle, so the non-drag alternative is not exercised. |
| 28 | Feedback | partial | Phase labels, field errors, `#paper-status`, and the receipt. `kit/paper.js`. | No timeout, duplicate-from-the-server, reconnect, or late-telemetry harness. |
| 29 | Anchoring Effect | partial | The margin note names the equipment specification and the 5–7 bar range next to 6.2 bar. | No control that switches the time window, and no separate “recommendation” versus “current” editor. |
| 30 | Endowment Effect | partial | Export this view writes the visible rows to `ledger.txt`. Restore default puts the authored order back. `kit/paper.js`. | No organisation-default policy, duplicate workspace, or account export. |
| 31 | Framing Effect | partial | The receipt uses 18 succeeded and 2 failed, not a lone percentage. Confirmation copy says Submit request, not a virtue label. | No percentage that declares its denominator and window, because the fixture does not show one. |

## What this pass changed

- Hero banner (`field`) keeps the paper column field and, on a desktop tier, adds a few sheets plus one vermilion seal. Sign-in uses a separate still life (`desk`) that sits clear of the form card.
- `prefers-reduced-motion` and `?motion=reduce` hold a still frame: scene time stops and the scroll camera returns to rest. Page fades and hover fills stay.
- The loop pauses when the hero section leaves the viewport, the tab is hidden, or the canvas has faded out. `?webgl=off`, a missing context, or a lost context shows `[data-scene-fallback]` without pushing the layout.
- The ledger gained named views, a local export, restore, a relationship list, and a tab-scoped draft with discard.

## Left doc-only

Server reconciliation, interlocks, authorisation, idempotency, virtualised tables, Playwright, axe, a certified WCAG audit, a digital-twin graph, the Motion library, glove targets, and field Web Vitals. See `SKILL.md` “What this kit does not pretend to be”.
