---
marp: true
theme: default
paginate: true
style: |
  section {
    font-family: system-ui, sans-serif;
  }
  section.lead h1 {
    font-size: 2.4em;
  }
  code {
    font-size: 0.85em;
  }
---

<!-- _class: lead -->

# Agentic Triage & Implement

**AI Day — GitHub Agentic Workflows with Claude Code**

Automatically triage issues and open PRs — no human in the loop.

---

## What We Built

A GitHub Actions workflow that runs Claude Code on every new issue:

1. **Classifies** the issue — bug, enhancement, question, or needs-more-info
2. **Investigates** — reads relevant source code, traces execution paths
3. **Implements** — opens a `fix:` or `feat:` PR if confident
4. **Summarises** — always posts a triage comment with classification + outcome

Target codebase: a minimal Next.js todo app with a seeded off-by-one bug.

---

## GitHub Agentic Workflows (`gh-aw`)

A GitHub CLI extension that compiles **Markdown workflow files** into standard Actions YAML.

```
.github/workflows/triage-and-implement.md   ← you edit this
.github/workflows/triage-and-implement.lock.yml  ← compiled, don't touch
```

The `.md` file is:
- **YAML front matter** — trigger, engine, permissions, safe-outputs, tools
- **Markdown body** — the natural language prompt driving agent behavior

---

## Workflow Front Matter

```yaml
on:
  issues:
    types: [opened]
engine: claude              # uses ANTHROPIC_API_KEY
permissions:
  contents: read
  issues: read
  pull-requests: read
safe-outputs:               # write actions, batched at end of run
  create-pull-request:
  add-labels:
  add-comment:
tools:
  github:
    toolsets: [default]
```

---

## Key Concept: Safe Outputs

All **write actions are batched** and executed after the agent finishes — there is no intermediate output during a run.

This means:
- ✅ PRs, labels, and comments all appear together at the end
- ❌ No "I'm investigating…" acknowledgment comment possible in a single workflow
- The agent reads freely during its run, then commits all outputs at once

**Implication:** don't try to split acknowledgment and action into two `add-comment` calls in one workflow — only the last state is applied.

---

## Engine: Claude Code

```yaml
engine: claude
```

- Requires `ANTHROPIC_API_KEY` secret on the repo
- Uses `claude-sonnet-4-6` by default
- Full agentic loop: reads files, reasons, writes code, opens PRs
- Default engine (`copilot`) uses GitHub Copilot — lighter weight but less capable for code generation

**Lesson:** Claude Code is well worth it for implementation tasks. Copilot is fine for pure classification/triage.

---

## What the Prompt Does

```
Step 1: Classify → apply label
         ↓ (bug or enhancement)
Step 2: Gather Context → read relevant source files
         ↓
Step 3: Investigate & Implement
   If bug  → find root cause → open fix: PR
   If enhancement → assess feasibility → open feat: PR
         ↓ (always)
Step 4: Post triage summary comment
```

The only hard guards: high confidence required, no breaking changes.

---

## The Seeded Bug

```typescript
// lib/todos.ts
export function countRemaining(todos: Todo[]): number {
  let count = 0;
  for (let i = 1; i < todos.length; i++) {  // ← starts at 1, skips first todo
    if (!todos[i].completed) count++;
  }
  return count;
}
```

Filing an issue: *"Item count in footer is always one less than expected"*

→ Agent finds the off-by-one, changes `i = 1` to `i = 0`, opens a PR. ✅

---

## What Didn't Work: Two-Workflow Chaining

We tried splitting triage and fix into separate workflows chained via labels:

```
triage.md  →  adds label triage:fix-queued
fix.md     →  triggers on issues: labeled: triage:fix-queued
```

**Problem:** `GITHUB_TOKEN` (the bot token) does not fire `issues: labeled` events that trigger other workflows — a GitHub security restriction.

**Workaround:** Set `GH_AW_GITHUB_TOKEN` to a real PAT. But this caused **two fix workflows** to fire (one per label added by triage).

**Decision:** Revert to a single workflow. Simpler, and safe-outputs batching isn't a real limitation in practice.

---

## Lessons Learned

| # | Lesson |
|---|--------|
| 1 | `safe-outputs` values must be **empty or `max:`**, not `true` |
| 2 | `tools` is an **object**, not an array |
| 3 | `permissions` — strict mode forbids write; use `safe-outputs` instead |
| 4 | All outputs are **batched** — no mid-run feedback in a single workflow |
| 5 | `GITHUB_TOKEN` cannot trigger other workflows — need a PAT for chaining |
| 6 | Always run `gh aw compile` after edits — catches schema errors early |
| 7 | Claude Code is powerful enough to implement enhancements, not just fix bugs |

---

## Repo Structure

```
.github/
  aw/actions-lock.json          # pinned action SHAs (like package-lock)
  workflows/
    triage-and-implement.md     # workflow source (edit this)
    triage-and-implement.lock.yml  # compiled output
app/
  page.tsx                      # Next.js todo UI
lib/
  todos.ts                      # utility logic (seeded bug lives here)
```

Deployed at: **https://ai-day-agentic-triage-fix.vercel.app**
PRs from the agent get Vercel preview deployments automatically.

---

<!-- _class: lead -->

## Try It

Open an issue on [`dcow/ai-day-agentic-triage-fix`](https://github.com/dcow/ai-day-agentic-triage-fix)

Watch Claude triage, investigate, and open a PR — all autonomously.
