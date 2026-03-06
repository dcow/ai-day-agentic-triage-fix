# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Three GitHub Agentic Workflows handle the full issue-to-PR lifecycle for a simple Next.js todo app:
- `triage-and-implement` — classifies issues, fixes bugs, implements enhancements, opens PRs
- `pr-risk-review` — reviews every PR for security and logic risks, labels with `risk:high` / `risk:low`
- `pr-review` — applies changes requested via `/fix` comments on PRs

## Commands

```bash
npm run dev            # Next.js dev server
npm run build          # Next.js production build
npm test               # vitest run
npm run lint           # eslint
nvm use && npm run build:slides   # regenerate slides PDF (Node 24 required)
```

## Workflow Tooling

Workflows are managed with the `gh aw` CLI extension:

```bash
gh aw compile                  # compile all .md → .lock.yml
gh aw compile <workflow-name>  # compile one workflow
gh aw validate                 # validate without writing lock files
gh aw list                     # show status
```

Always run `gh aw compile` after editing any workflow `.md` file. Never edit `.lock.yml` files directly.

## Workflow File Format

`.github/workflows/*.md` files use a hybrid format:
- **YAML front matter** (between `---`): trigger, permissions, safe-outputs, tools
- **Markdown body**: the natural language prompt

### Front matter gotchas

**`safe-outputs`** — values must be empty or `max: N`, not `true`:
```yaml
safe-outputs:
  create-pull-request:       # correct
  add-comment:
    max: 2                   # correct
  add-labels: true           # WRONG — schema error
```

**`tools`** — must be an object, not an array:
```yaml
tools:
  github:
    toolsets: [default]      # correct
```

**`permissions`** — only read permissions allowed. Write ops go through `safe-outputs` only:
```yaml
permissions:
  contents: read
  issues: read
  pull-requests: read
```

**`pull-requests: write`** is forbidden even if you want to submit reviews — use `safe-outputs: submit-pull-request-review:` instead.

## Known Platform Quirks (GitHub Agentic Workflows)

- **Label node IDs during PR creation**: applying labels as part of `create_pull_request` fails with a node ID resolution error. Fix: use a separate `add-labels` safe output after the PR is created, passing the PR number.
- **Fallback issue cascade**: when a safe output fails, gh-aw creates a fallback issue with `<!-- gh-aw-agentic-workflow -->` in the body. If the triage workflow triggers on that issue, it loops. Guard: check for this marker at Step 0 and `noop` immediately.
- **Token identity**: `GITHUB_TOKEN` (the Actions app) can't trigger other workflows when used to open PRs. Use `GH_AW_GITHUB_TOKEN` (a PAT) for PR creation to allow downstream CI to trigger. However, a PR author cannot submit `REQUEST_CHANGES` on their own PR — GitHub silently downgrades it to `COMMENT`. This means the risk reviewer and the PR opener must be different identities (requires a machine account).
- **`GH_AW_CI_TRIGGER_TOKEN`**: separate secret for triggering CI on agent-created PRs. Set to the same PAT as `GH_AW_GITHUB_TOKEN`. If unset, test workflows won't run on agent PRs.
- **No mid-run job outputs**: the agent's decisions aren't available as Actions job outputs. Workaround for failing status checks: a separate `pull_request_review`-triggered workflow (see stashed `risk-gate.yml`).
- **Slash command `\r\n` bug**: the `/fix` predicate matches `startsWith('/fix ')` or exact `'/fix'`. A comment typed in the GitHub web editor with `/fix` on its own line followed by text uses `\r\n` line endings, which breaks both conditions. Write `/fix <instructions>` on a single line.
- **`reaction: eyes`**: fires immediately when the workflow activates, before the agent starts. Important for UX — safe outputs only flush at the end of the run.

## Secrets

| Secret | Purpose |
|--------|---------|
| `ANTHROPIC_API_KEY` | Claude API |
| `GH_AW_GITHUB_TOKEN` | PAT for agent GitHub MCP access, branch push, PR creation. Needs: Contents, Issues, Pull requests, Workflows (all read/write) |
| `GH_AW_CI_TRIGGER_TOKEN` | Triggers CI on agent-opened PRs. Set to same value as `GH_AW_GITHUB_TOKEN` |

## Slides

`slides/slides.md` → `public/slides.pdf`. PDF is committed to git (Vercel can't run Chrome). Node 24 required — marp-cli breaks on Node 25+ due to a yargs ESM/CJS conflict. Always `nvm use` before `npm run build:slides`.

## App Structure

- `lib/todos.ts` — pure TS functions: `createTodo`, `filterTodos`, `countRemaining`. No React, no DOM. Trivially testable.
- `app/page.tsx` — client component, all state in React `useState`
- `lib/todos.test.ts` — vitest tests; use `it.fails()` to document known bugs before fixing

## Stashed Work

- `git stash list` → `risk-gate workflow`: a `pull_request_review`-triggered Actions workflow that fails when a reviewer requests changes. Enables a required status check that blocks merges on `risk:high` reviews. To activate: `git stash pop`, push, add `Risk Gate` as a required status check in branch protection rules.
