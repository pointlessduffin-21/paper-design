#!/usr/bin/env bash
# Install the Paper design system into Claude Code on this machine.
#   curl-free:  git clone git@github.com:pointlessduffin-21/claude-paper-design.git && ./claude-paper-design/install.sh
# Safe to re-run: it updates in place.
set -euo pipefail

REPO="pointlessduffin-21/claude-paper-design"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
MD="$CLAUDE_DIR/CLAUDE.md"
START='<!-- paper-design:start -->'
END='<!-- paper-design:end -->'

command -v claude >/dev/null || { echo "claude CLI not found — install Claude Code first." >&2; exit 1; }
mkdir -p "$CLAUDE_DIR"

# 1. The global rule, between markers so a re-run replaces rather than duplicates it.
touch "$MD"
python3 - "$MD" "$HERE/global/CLAUDE.paper.md" "$START" "$END" <<'PY'
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
echo "✓ Paper rule in $MD"

# 2. The plugin (skill + kit), from GitHub so `claude plugin update` keeps it current.
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
