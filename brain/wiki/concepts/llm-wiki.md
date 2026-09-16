---
title: LLM Wiki
type: concept
updated: 2026-09-11
tags: [knowledge-base]
sources: [karpathy-llm-wiki]
---

# LLM Wiki

A personal knowledge base maintained by an LLM as a persistent, interlinked markdown wiki. New sources are compiled into pages (entities, concepts, source summaries, analyses), not merely indexed for later retrieval.

This is the compile-vs-retrieve split: retrieval-augmented generation rediscovers fragments on every question; the wiki is a compounding artifact whose links and tensions are already resolved or flagged. You rarely write the pages. You source, question, and steer. The agent files, cross-references, and lints.

Layers in this repo: `brain/raw/` (immutable), `brain/wiki/` (agent-owned), schema in the brain skill, AGENTS.md, and [[conventions]]. Viewer of choice can be Obsidian; git versions the files.

## Tensions

- A compiled page can ossify around a stale claim. Lint for contradictions; prefer dated tension notes over silent overwrite.
- Do not copy moving values into prose (live SHAs, "currently N pages"). That is a second home for state that will drift.

## Links

- Formation: [[gradual-formation]]
- Source: [[karpathy-llm-wiki]]
- Catalog: [[index]]
