---
marp: true
theme: default
paginate: true
style: |
  section {
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 1.1em;
    padding: 48px 60px;
  }
  section.lead {
    background: #0f172a;
    color: #f8fafc;
  }
  section.lead h1 {
    font-size: 2.2em;
    line-height: 1.15;
    color: #f8fafc;
    margin-bottom: 0.3em;
  }
  section.lead p {
    color: #94a3b8;
    font-size: 1.05em;
  }
  section.lead strong { color: #38bdf8; }
  section.dark {
    background: #0f172a;
    color: #f8fafc;
  }
  section.dark h2 { color: #38bdf8; }
  section.dark p, section.dark li { color: #94a3b8; }
  section.dark strong { color: #f8fafc; }
  section.dark code {
    background: #1e293b;
    color: #7dd3fc;
  }
  h2 {
    font-size: 1.5em;
    color: #0f172a;
    border-bottom: 3px solid #0ea5e9;
    padding-bottom: 0.2em;
    margin-bottom: 0.6em;
  }
  code {
    font-size: 0.82em;
    background: #f1f5f9;
    color: #be185d;
    padding: 1px 5px;
    border-radius: 4px;
  }
  pre {
    background: #0f172a;
    border-radius: 8px;
  }
  pre code {
    background: transparent;
    color: #e2e8f0;
    font-size: 0.8em;
    padding: 0;
  }
  ul { margin-top: 0.4em; }
  li { line-height: 1.7; }
  table {
    font-size: 0.9em;
    border-collapse: collapse;
    width: 100%;
  }
  th { background: #f1f5f9; }
  td, th { padding: 6px 12px; border: 1px solid #e2e8f0; }
---

<!-- _class: lead -->

# Autonomous Issue Triage & Implementation

**AI Day · GitHub Agentic Workflows with Claude**

From filed issue to merged PR — no human in the loop.

`dcow/ai-day-agentic-triage-fix`

---

## Scope & Goals

**The question:** Can an AI agent autonomously handle the full lifecycle of a GitHub issue — triage, root cause analysis, code fix, PR, and safety review?

**The exercise:**
- A small Next.js todo app with a seeded off-by-one bug
- Three workflows running Claude Sonnet on GitHub Actions
- End-to-end: issue filed → PR opened → risk reviewed → ready to merge

**Not a prototype** — real workflows, real GitHub API calls, full audit trail in Actions logs.

---

## The Platform: GitHub Agentic Workflows (`gh-aw`)

A GitHub CLI extension that compiles **Markdown workflow files** into standard Actions YAML.

```yaml
# .github/workflows/triage-and-implement.md
---
on:
  issues:
    types: [opened]
  reaction: eyes          # ← fires 👀 immediately at activation
engine: claude
permissions:
  contents: read
safe-outputs:             # ← all write actions declared upfront
  create-pull-request:
  add-labels:
  add-comment:
tools:
  github:
    toolsets: [default]
---

# Natural language prompt follows…
```

`gh aw compile` produces a `.lock.yml` — the actual Actions YAML that runs.

---

## Three Workflows, One Loop

| Trigger | Workflow | What it does |
|---------|----------|--------------|
| Issue opened | `triage-and-implement` | Classify → investigate → open fix/feat PR → post summary |
| `/fix <text>` on PR | `pr-review` | Apply requested change → push commit → reply Done |
| PR opened | `pr-risk-review` | Review diff + context → flag risks → REQUEST_CHANGES or COMMENT |

**Reactions for instant feedback:** `reaction: eyes` fires 👀 on issues, `reaction: rocket` fires 🚀 on `/fix` commands — before the agent even starts running.

---

## Workflow 1: triage-and-implement

**Trigger:** any new issue

```
Step 1  Classify → bug / enhancement / question / needs-more-info
        Apply the matching label. If question or needs-more-info, skip to Step 4.

Step 2  Gather context → find relevant files, read source, check recent commits

Step 3  Investigate & implement (high confidence only)
        Bug:         trace execution path, find root cause, write minimal fix
        Enhancement: assess feasibility, implement if well-specified

        Open a PR:  fix: … (label: bug)  or  feat: … (label: enhancement)

Step 4  Post triage summary comment — always, with inline PR link if opened
```

**Guard rails:** only proceeds with a fix if root cause is specific and localized. No guessing.

---

## Workflow 2: pr-review (`/fix`)

**Trigger:** `/fix <description>` comment on a pull request

The `slash_command` event type gates invocation at the **Actions predicate level** — no agent spin-up for unrelated comments.

```yaml
on:
  slash_command:
    name: fix
    events: [pull_request_comment]   # ← PR comments only, not issues
  reaction: rocket
```

**What it does:**
1. Reads PR diff + full comment thread
2. Applies the requested change surgically — no unrelated refactoring
3. Pushes a new commit to the PR branch
4. Posts: **Done —** `<one sentence describing what changed>`

---

## Workflow 3: pr-risk-review

**Trigger:** every PR opened (including ones the triage agent opens)

Acts as a **skeptical senior engineer** — not a linter. Reads the full diff *and* the surrounding context of changed files to understand invariants and callers.

Flags:
- Logic errors (off-by-one, wrong condition)
- Edge cases (null, empty, concurrent access)
- Regressions (silent behavior changes for existing callers)
- Error handling gaps
- API / contract changes

**Severity → review event:**
- `high` → `REQUEST_CHANGES` (blocks merge)
- `medium` / `low` → `COMMENT`
- Nothing found → "No significant risks identified."

---

## The XSS Demo

To test the risk reviewer, we opened a PR that swapped safe React rendering for raw HTML injection:

```tsx
// before (safe)
<span>{todo.text}</span>

// after (vulnerable)
<span dangerouslySetInnerHTML={{ __html: todo.text }} />
```

**PR title:** *"feat: render todo text as HTML for rich formatting support"* — plausible, no obvious red flags in the description.

**Result:** The risk reviewer flagged it as **high severity** XSS, explained the attack vector, and submitted `REQUEST_CHANGES` — blocking the merge automatically.

---

## Safe Outputs: The Security Model

<!-- _class: dark -->

The agent cannot write to GitHub during its run. All write actions are:

1. **Declared upfront** in `safe-outputs:` — the agent can't do anything not on the list
2. **Batched** — executed together after the agent finishes
3. **Auditable** — every tool call, read, and output appears in the Actions log

```yaml
safe-outputs:
  create-pull-request:      # triage-and-implement
  add-labels:
  add-comment:
  push-to-pull-request-branch:   # pr-review
  submit-pull-request-review:    # pr-risk-review
```

This is the key safety primitive: **constraints live in config, not in prose** the model might reason around.

---

## Key Insights

**Reactions solve "dead silence"** — safe outputs batch at the end. A `reaction: eyes` fires immediately at activation, so users see acknowledgment before the agent even starts.

**Predicate filtering > prompt filtering** — use `slash_command` triggers and `pull_request_comment` (not `issue_comment`) to scope at the Actions level. By the time the agent runs, it's already scoped correctly.

**Two Claudes > one Claude** — the triage agent opens PRs; the risk reviewer catches what it missed. Separate agents, separate prompts, separate trust levels. The reviewer doesn't know who opened the PR.

**Don't fight the batching** — reactions cover the UX gap. Accept the batch model and design for it.

**Claude Code for implementation, not just triage** — the same agent that classifies an issue writes production code and opens a PR. Don't undersell the engine.

---

<!-- _class: lead -->

## The Outcome

Three working autonomous workflows on a real GitHub repo:

- **Issues** → classified, investigated, and fixed or implemented automatically
- **PRs** → code changes applied on demand with `/fix`
- **Every PR** → risk-reviewed by a second Claude instance before merge

The issue tracker becomes a product spec. The constraint shifts from **developer time** to **issue quality** — well-specified means automatically implemented.

**Try it:** file an issue on `dcow/ai-day-agentic-triage-fix`
