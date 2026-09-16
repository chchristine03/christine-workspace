---
title: Conventions
type: overview
updated: 2026-09-11
tags: [schema]
sources: [karpathy-llm-wiki]
---

# Conventions

Co-evolved schema for this wiki. Agents read this before writing wiki pages. Add a rule here only after it prevents a real mistake.

## Paths

- Root: `/Users/christine/PersonalProjects/brain/`
- Raw (immutable): `brain/raw/`
- Wiki: `brain/wiki/`
- Skill: `~/.cursor/skills/brain/SKILL.md`

## Split of durable artifacts

- **Linear**: work, status, session follow-ups
- **Wiki**: compiled knowledge, sources, entities, concepts, filed analyses

## Formation

Grow this wiki as described in [[gradual-formation]]. Prefer one ingest at a time. File worthwhile answers back. Lint instead of rebuilding.

## Links and files

- Obsidian `[[wikilinks]]`, filename kebab-case, no `.md` inside the link
- Log lines start with `## [YYYY-MM-DD] <op> | Title`
- Do not copy moving values into prose (SHAs, live counts, last-sync times)
- Never edit files under `brain/raw/`
