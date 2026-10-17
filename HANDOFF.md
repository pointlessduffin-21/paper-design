# HANDOFF

## Project

paper-design is Roel Abarca's distribution repo for the **Paper** design system and his global
Claude Code rules. It is a private GitHub repo, `pointlessduffin-21/paper-design`, on `main`.

What it contains:

- `plugins/paper-design/`: the `paper-design` plugin. Its skill is `skills/paper-design/SKILL.md`,
  its rules are `GUIDELINES.md`, and its kit is in `skills/paper-design/kit/`
  (`paper.css`, `tool.css`, `paper.js`, `scenes-kit.js`, `tailwind-preset.js`, templates, `vendor/`).
- `.claude-plugin/marketplace.json`: the `yeems214` plugin marketplace.
- `global/`: rule blocks (`CLAUDE.paper.md`, `CLAUDE.agents.md`, `CLAUDE.workflow.md`) and agent
  definitions (`agents/docs.md`, `agents/worker.md`).
- `scripts/check-kit.mjs`: checks the kit.
- `install.sh`: the script each machine runs.

Stack: Bash, an inline Python 3 block in `install.sh`, Node (for the kit check), Markdown.
The machine needs the `claude` CLI and `python3`.

How to run it on a machine:

```bash
git clone git@github.com:pointlessduffin-21/paper-design.git ~/paper-design   # or the HTTPS URL
~/paper-design/install.sh
```

How to test it:

```bash
node --test scripts/check-kit.mjs    # 11 tests, all passing when last run
bash -n install.sh                   # syntax check
```

How to deploy it: push to `main`. Other machines pick the change up with
`cd ~/paper-design && git pull && ./install.sh`, then a restart of Claude Code.

## Current state

- `install.sh` loops over every `global/CLAUDE.<name>.md` and writes each one into
  `~/.claude/CLAUDE.md` between `<!-- <name>:start/end -->` markers. The Paper rule keeps the
  legacy `paper-design` markers. It then copies `global/agents/*.md` to `~/.claude/agents/`.
- Done on the author's machine: `install.sh` ran twice. The second run left `~/.claude/CLAUDE.md`
  byte-identical. It has the `paper-design`, `agents` and `workflow` blocks, and the agents were copied.
- Done: `node --test scripts/check-kit.mjs` passes 11 of 11 on this checkout.
- Done in this change: the model-routing rule (`global/CLAUDE.agents.md`) and the two agents,
  plus the CHANGELOG.md, HANDOFF.md and README updates.
- Not in the repo: no `AGENTS.md`, `CLAUDE.md` or `.github/copilot-instructions.md`. The workflow
  rule only asks for one of these if the repo has it.

## Next steps

1. Every other machine runs `cd ~/paper-design && git pull && ./install.sh`, then restarts Claude Code.
2. On a machine that has a hand-written "Model and effort" section in `~/.claude/CLAUDE.md`
   outside the markers, delete that section by hand before or after the run. Otherwise the
   routing rule appears twice.
3. Machines that were never set up with the `agents` block should run step 1 to get the
   `docs` and `worker` agents.

## Gotchas

- The `docs` agent is the Haiku agent for pushes, CHANGELOG.md and HANDOFF.md. The `worker`
  agent is Sonnet and is used only when the user asks for multiple agents (max 5 at once).
- The README says "Agents" where it means Claude Code. Leave that wording unless the owner asks to change it.
- Never force-push. Never put secrets, tokens or customer data in these files.
