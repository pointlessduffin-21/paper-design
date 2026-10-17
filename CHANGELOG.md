# Changelog

## 2026-10-18

- Added `global/CLAUDE.agents.md`: the model-routing rule (Opus 5.5 for the main session,
  Haiku 5.5 `docs` agent for documentation, Sonnet 5.5 `worker` agent for multi-agent work,
  max 5 at once). `install.sh` installs it as an `agents` marker block in `~/.claude/CLAUDE.md`.
- Added `global/agents/docs.md` (model: haiku) and `global/agents/worker.md` (model: sonnet).
  `install.sh` copies them to `~/.claude/agents/` after the rule blocks are written.
- Added HANDOFF.md, the handoff file for Codex, Claude Code and Copilot, under the
  "Pushing and handoff notes" rule in `global/CLAUDE.workflow.md`.
- README.md: the install section lists the three things `install.sh` does, and the layout
  section covers `global/CLAUDE.agents.md` and `global/agents/`. It also warns about a
  hand-written "Model and effort" section left outside the markers.
