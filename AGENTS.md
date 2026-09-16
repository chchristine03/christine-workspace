# Project Instructions

This file provides shared instructions for AI agents working in this repo.

## Issue tracking

Call the Linear MCP for all things that have to do with tracking projects or tasks that should be durable. Follow the Linear skill for the workflow.

If Linear MCP is unavailable or unauthenticated, authenticate it before continuing. Do not fall back to Beads.

## Durable knowledge (second brain)

Linear tracks **work**. Compiled knowledge lives in [`brain/`](brain/) and is **formed gradually** — one source, one synthesis, one lint pass at a time — not dumped from chat. Follow the [brain skill](../.cursor/skills/brain/SKILL.md). How the wiki should grow: [`brain/wiki/concepts/gradual-formation.md`](brain/wiki/concepts/gradual-formation.md). Pattern: [Karpathy LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f).

- Put new sources in `brain/raw/` (immutable). The agent compiles them into `brain/wiki/`.
- File worthwhile answers back into the wiki so exploration compounds.
- Never treat the wiki as a todo list; remaining work goes in Linear.

## Session close

1. File remaining durable work in Linear
2. Compile durable knowledge into `brain/` per the [brain skill](../.cursor/skills/brain/SKILL.md) (ingest a source, file back a synthesis). Skip if nothing compounded. See [gradual formation](brain/wiki/concepts/gradual-formation.md).
3. Run quality gates if code changed (tests, linters, builds)
4. Run `git status` and report changed files; do not commit or push unless asked
5. Hand off: what changed, how it was validated, and any Linear issue status

## Git

Do not commit, push, amend, or force-push unless explicitly asked. Direct user instructions override this file.

## Non-interactive shell

Always use non-interactive flags with file operations. `cp`, `mv`, and `rm` may be aliased to `-i` and will hang waiting for input.

```bash
cp -f source dest
mv -f source dest
rm -f file
rm -rf directory
cp -rf source dest
```

Other commands that may prompt:

- `scp` / `ssh` — use `-o BatchMode=yes`
- `apt-get` — use `-y`
- `brew` — set `HOMEBREW_NO_AUTO_UPDATE=1`

## Build & Test

_Add your build and test commands here_

```bash
# Example:
# npm install
# npm test
```

## Architecture Overview

Personal projects live under `projects/`. Durable compiled knowledge lives under `brain/` (raw sources + LLM-maintained wiki). Agent skills for this machine live in `~/.cursor/skills/` (`linear`, `brain`).

## Conventions & Patterns

Wiki page conventions live in [`brain/wiki/conventions.md`](brain/wiki/conventions.md) and co-evolve with use. See [gradual formation](brain/wiki/concepts/gradual-formation.md).
