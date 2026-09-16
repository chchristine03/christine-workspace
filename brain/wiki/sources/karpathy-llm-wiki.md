---
title: LLM Wiki (Karpathy gist)
type: source
updated: 2026-09-11
tags: [knowledge-base]
sources: []
---

# LLM Wiki (Karpathy gist)

- Raw: `brain/raw/karpathy-llm-wiki.md`
- URL: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
- Date: 2026-04-04 (gist created); ingested 2026-09-11

## Takeaways

- RAG re-derives answers from raw chunks every time. A wiki **compiles** knowledge so synthesis, cross-references, and contradictions are already on disk.
- Three layers: immutable raw sources, LLM-owned wiki, and a schema (AGENTS.md + skill + [[conventions]]) that you co-evolve.
- Operations that matter: ingest, query, lint. Good query answers should be filed back so exploration compounds.
- `index.md` is the catalog; `log.md` is the timeline. At moderate scale they replace embedding RAG.
- Humans abandon wikis because bookkeeping grows faster than value. The agent does the bookkeeping.

## Claims to track

- The wiki stays useful only if it is maintained on every ingest, not rebuilt from chat.
- Obsidian is a viewer (graph, backlinks); the agent is the writer.
- Related ancestor: Vannevar Bush's Memex (1945) — curated private trails between documents.

## Links

- Concepts: [[llm-wiki]], [[gradual-formation]]
