---
name: ui-ux-pro-max
description: "Codex-native mirror of the Claude UI/UX Pro Max skill."
---

# UI/UX Pro Max - Codex Mirror

This is the Codex CLI entrypoint for the canonical Claude skill at `{project-root}/.claude/skills/ui-ux-pro-max`.

Before doing UI/UX work, read `{project-root}/.claude/skills/ui-ux-pro-max/SKILL.md` and follow its workflow. Treat the Claude copy as the source of truth and this file as the native Codex-facing shim.

When you need the implementation assets, resolve them from the canonical folder:

- `{project-root}/.claude/skills/ui-ux-pro-max/scripts/search.py`
- `{project-root}/.claude/skills/ui-ux-pro-max/scripts/design_system.py`
- `{project-root}/.claude/skills/ui-ux-pro-max/scripts/core.py`
- `{project-root}/.claude/skills/ui-ux-pro-max/data/...`

Use this mirror whenever the user asks for UI/UX design, implementation, review, or optimization. If the canonical skill changes, update this mirror in the same change so Codex and Claude stay in parity.
