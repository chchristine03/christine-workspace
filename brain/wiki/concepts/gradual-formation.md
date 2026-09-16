---
title: Gradual formation
type: concept
updated: 2026-09-11
tags: [knowledge-base, schema]
sources: [karpathy-llm-wiki]
---

# Gradual formation

This second brain is supposed to **accrue**, not to be filled in one sitting. Chat is a workbench. The wiki is what remains.

## How knowledge enters

1. **One source at a time.** Drop a file in `brain/raw/`, ingest it, read the pages it touched, then add another. Batch only when you explicitly ask.
2. **Compile, don't index.** Each ingest updates a source page plus the entity and concept pages it changes, then `index.md` and `log.md`. A source that only produces an isolated summary has not been integrated.
3. **Stay in the loop on substantial sources.** Takeaways first; writes second. Emphasis is yours.
4. **File answers back.** A comparison, thesis, or connection from a query belongs in `brain/wiki/analyses/` if you would want it next month. Otherwise it dies in the transcript.
5. **Lint instead of restarting.** Contradictions, orphans, missing pages, stale claims. Create a new page when a concept has enough substance to stand alone — mention-stubs are worse than a gap.
6. **Co-evolve the schema.** When a mistake repeats, add a rule to [[conventions]] or the brain skill. Do not front-load a huge rulebook.

## What does not belong here

- Tasks, status, and session leftovers → Linear
- Secrets, credentials, live machine state
- A paste of the whole internet or an entire chat export

## Why gradual

Karpathy's point in [[llm-wiki]]: the cost of bookkeeping used to kill wikis. The agent can touch many files per ingest, so the wiki can stay consistent **if** each increment is integrated. A bulk dump skips that integration and recreates the RAG pile under a new name.

## Links

- Pattern: [[llm-wiki]]
- Source: [[karpathy-llm-wiki]]
- Schema: [[conventions]]
