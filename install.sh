#!/usr/bin/env bash
# Install the Paper design system into Claude Code on this machine.
#   git clone git@github.com:pointlessduffin-21/paper-design.git ~/paper-design && ~/paper-design/install.sh
# Safe to re-run: it updates in place.
set -euo pipefail

REPO="pointlessduffin-21/paper-design"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
MD="$CLAUDE_DIR/CLAUDE.md"

command -v claude >/dev/null || { echo "claude CLI not found — install Claude Code first." >&2; exit 1; }
mkdir -p "$CLAUDE_DIR"

# 1. The global rules. Every global/CLAUDE.<name>.md becomes a block between
#    <!-- <name>:start/end --> markers, so a re-run replaces it rather than duplicating it.
#    CLAUDE.paper.md keeps the legacy "paper-design" markers.
touch "$MD"
for block in "$HERE"/global/CLAUDE.*.md; do
    name="$(basename "$block" .md)"; name="${name#CLAUDE.}"
    [ "$name" = "paper" ] && name="paper-design"
    python3 - "$MD" "$block" "<!-- $name:start -->" "<!-- $name:end -->" <<'PY'
import sys, re
md, block_path, start, end = sys.argv[1:]
text = open(md).read()
block = f"{start}\n{open(block_path).read().strip()}\n{end}"
if start in text and end in text:
    text = re.sub(re.escape(start) + r".*?" + re.escape(end), lambda _: block, text, flags=re.S)
else:
    text = (text.rstrip() + "\n\n" if text.strip() else "") + block + "\n"
open(md, "w").write(text)
PY
    echo "✓ $name rule in $MD"
done

# The agents the routing rule hands work to (docs = Haiku, worker = Sonnet).
mkdir -p "$CLAUDE_DIR/agents"
cp "$HERE"/global/agents/*.md "$CLAUDE_DIR/agents/"
echo "✓ docs + worker agents in $CLAUDE_DIR/agents"

# 2. The plugin (skill + kit), from GitHub so `claude plugin update` keeps it current.
# Machines set up before the repo was renamed still point at the old name;
# re-add so updates come from the right place.
if claude plugin marketplace list 2>/dev/null | grep -q "claude-paper-design"; then
    claude plugin marketplace remove yeems214 >/dev/null
fi
if claude plugin marketplace list 2>/dev/null | grep -q "yeems214"; then
    claude plugin marketplace update yeems214 >/dev/null
else
    claude plugin marketplace add "$REPO" >/dev/null
fi
if claude plugin list 2>/dev/null | grep -q "paper-design@yeems214"; then
    claude plugin update paper-design@yeems214 >/dev/null || true
else
    claude plugin install paper-design@yeems214 >/dev/null
fi
echo "✓ paper-design plugin installed"
echo "Restart Claude Code (or start a new session) to pick it up."
