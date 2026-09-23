# paper-design

My **Paper** design system for Agents: the default look for every website and web-tool front
end I build. It has a paper ground, ink type and one vermilion accent, set in Instrument Serif,
Inter and JetBrains Mono, mobile-first, with high-fidelity Three.js scenes rendered onto the paper.
The reference is https://yeems214.xyz.

## Install on a machine

```bash
git clone git@github.com:pointlessduffin-21/paper-design.git ~/paper-design
~/paper-design/install.sh
```

This repo is **private**, so the machine needs GitHub access as `pointlessduffin-21`: an SSH key,
or run `gh auth login` first. On a machine without an SSH key, clone over HTTPS instead:

```bash
git clone https://github.com/pointlessduffin-21/paper-design.git ~/paper-design
```

Inside Agents you can run the same lines with a `!` prefix (for example
`! ~/paper-design/install.sh`).

Then restart Agents. The script is safe to re-run. It does two things:

1. Adds the "always use Paper" rule to `~/.claude/CLAUDE.md`, between
   `<!-- paper-design:start/end -->` markers, so a re-run replaces it instead of duplicating it.
2. Adds this repo as the `yeems214` plugin marketplace and installs `paper-design@yeems214`,
   which provides the skill and its kit.

If you only want the plugin, run these inside Agents:

```
/plugin marketplace add pointlessduffin-21/paper-design
/plugin install paper-design@yeems214
```

## Update

```bash
cd ~/paper-design && git pull && ./install.sh
```

## Layout

```
.plugin/marketplace.json          marketplace "yeems214"
plugins/paper-design/
  .plugin/plugin.json
  skills/paper-design/SKILL.md           the rules
  skills/paper-design/kit/               paper.css · tool.css · paper.js · scenes-kit.js
                                         tailwind-preset.js · template.html
global/CLAUDE.paper.md                   the rule block install.sh puts in ~/.claude/CLAUDE.md
install.sh
```

To change the design system, edit the files under `plugins/paper-design/`, bump `version` in
`plugin.json`, then push. Other machines pick it up with the update command above.
