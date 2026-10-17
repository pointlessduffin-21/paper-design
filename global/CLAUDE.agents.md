## Model and effort

Every model runs at **high effort**. Which model does what:

| Work | Model | Agents |
|---|---|---|
| Heavy planning and execution (the main work: code, debugging, design, deploys) | **Opus 5.5, high** | **1 only** — the main session, no subagents |
| Document checking, document writing, documentation, summarization, **commits and pushes**, changelogs and handoff notes | **Haiku 5.5, high** | hand it to the `docs` agent (`subagent_type: "docs"`) |
| Multi-agent work, only when I ask for multiple agents | **Sonnet 5.5, high** | **max 5** at once — the `worker` agent (`subagent_type: "worker"`) |

- Do not drop to a smaller or faster model on your own to save time or tokens; the
  table above is the only routing.
- Docs work means: writing or updating READMEs, HANDOFF.md/CHANGELOG entries, reports,
  handoff notes, summaries of logs/transcripts/diffs, and proof-reading documents.
  Delegate it to `docs` with a precise brief, then check what it wrote before
  committing. Small doc edits that are part of a code change (e.g. one "Recent
  history" line in the same commit) can stay in the main session.
- If I name a model for a task ("use sonnet 5.5 high for this"), that wins for that task.

## How many agents

- **Single agent by default** (Opus). Do not spawn subagents, workflows, or parallel
  fan-out on your own initiative, however well the task would parallelise. The one
  exception is the `docs` (Haiku) agent for the docs work listed above.
- Multiple agents only when I ask for them ("with multiple agents", "fan out",
  "sonnet 5.5 high with multiple agents"): use the `worker` agent (Sonnet 5.5, high),
  **never more than 5 at a time**, including inside workflows.
- If a task would genuinely benefit from fan-out, say so in one line and let me
  decide. Do not start it and tell me afterwards.
- Pushes, CHANGELOG.md and HANDOFF.md also go to `docs` (Haiku); see the
  "Pushing and handoff notes" rule.
