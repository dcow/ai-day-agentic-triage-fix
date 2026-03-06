# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This repository defines a GitHub Actions-based AI agent that automatically triages new GitHub issues and opens pull requests for confirmed bugs and well-scoped enhancements. The repo also includes a simple Next.js todo app as the target codebase for testing the workflow.

## Tooling

Workflows are managed with the `gh aw` CLI extension (GitHub Agentic Workflows):

```bash
gh aw compile                  # Compile all workflows (generates .lock.yml files)
gh aw compile triage-and-implement   # Compile a specific workflow
gh aw validate                 # Validate without generating lock files
gh aw list                     # List all workflows and their status
gh aw run triage-and-implement       # Run a workflow on GitHub Actions
```

Always run `gh aw compile` after editing a workflow file to catch errors.

## Workflow File Format

`.github/workflows/triage-and-implement.md` uses a hybrid format:

- **YAML front matter** (between `---` delimiters): trigger, permissions, safe-outputs, tools
- **Markdown body**: the natural language prompt that drives agent behavior

### Front matter field syntax (common mistakes)

**`safe-outputs`** — values must be empty or an object with `max:`, not `true`:
```yaml
safe-outputs:
  create-pull-request:       # correct
  add-comment:
    max: 2                   # correct (with limit)
  add-labels: true           # WRONG — causes schema error
```

**`tools`** — must be an object, not an array:
```yaml
tools:
  github:
    toolsets: [default]      # correct

tools:                       # WRONG — causes schema error
  - name: github-mcp
```

**`permissions`** — strict mode forbids write permissions (`issues: write`, `pull-requests: write`). Write operations are handled exclusively via `safe-outputs`. Read permissions are still required for toolsets that access those APIs:
```yaml
permissions:
  contents: read
  issues: read               # required if using github toolset with issues
  pull-requests: read        # required if using github toolset with PRs
```

### Key front matter fields

| Field | Purpose |
|---|---|
| `on` | GitHub event trigger (same syntax as standard Actions workflows) |
| `permissions` | Read-only GitHub token permissions |
| `safe-outputs` | Write actions the agent is allowed to perform |
| `tools` | Toolsets available to the agent (e.g., `github` with `toolsets: [default]`) |

## Slides

`slides/slides.md` is the source. `public/slides.pdf` is the generated output and is committed to the repo (served as a static asset by Vercel — PDF generation requires Chrome which isn't available in Vercel's build environment).

To regenerate after editing the slides:

```bash
npm run build:slides   # requires Chrome installed locally
git add public/slides.pdf && git commit -m "chore: regenerate slides"
```

## Modifying Agent Behavior

Edit the prompt body in `.github/workflows/triage-and-implement.md`. To add new write capabilities (e.g., posting comments), add the corresponding entry to `safe-outputs` and recompile. Always run `gh aw compile` after any edits.
