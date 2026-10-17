## Pushing and handoff notes (all projects)

- **Haiku 5.5 does the pushing and the handoff notes.** When I ask you to push (or you are
  about to), and whenever you write or update a changelog or handoff note, do that step in a
  subagent: call the Agent tool with `model: "haiku"` (Haiku 5.5, `claude-haiku-5-5`) and
  brief it with the diff/commits and the context it needs. Don't do these steps on the main
  model. This covers `git push` and the changelog/handoff writing, not the coding itself.
- Keep the usual push rules: commit/push only when I've asked, never force-push, and put the
  attribution lines the harness gives you on commits and PRs.
- **Write the notes so another agent can pick up cold.** Codex, Claude Code and Copilot may
  continue the work, so the notes go in plain Markdown at the repo root, not in chat or memory:
  - `CHANGELOG.md` — newest first, dated entries of what was implemented, changed or fixed.
  - `HANDOFF.md` — rewritten (not appended) on each push, with: what the project is and its
    stack, how to run/build/test it, what's done, what's in progress or broken, the next steps
    in order, and any gotchas or decisions a newcomer would otherwise get wrong.
- Write for someone who has not seen this conversation: name files and commands exactly, and
  say what state things are in. Don't paste secrets, tokens or customer data into either file.
- If the repo has an `AGENTS.md` or `CLAUDE.md`, make sure it points to `HANDOFF.md`.
