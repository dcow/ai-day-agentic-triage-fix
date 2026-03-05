# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This repository defines a GitHub Actions-based AI agent that automatically triages new GitHub issues and attempts to generate bug fixes via pull requests. There is no build system, test suite, or application code — the repository's sole artifact is an agentic workflow definition.

## Tooling

Workflows are managed with the `gh aw` CLI extension (GitHub Agentic Workflows):

```bash
gh aw compile                  # Compile all workflows (generates .lock.yml files)
gh aw compile triage-and-fix   # Compile a specific workflow
gh aw validate                 # Validate without generating lock files
gh aw list                     # List all workflows and their status
gh aw run triage-and-fix       # Run a workflow on GitHub Actions
```

Always run `gh aw compile` after editing a workflow file to catch errors.

## Workflow File Format

`.github/workflows/triage-and-fix.md` uses a hybrid format:

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

## Modifying Agent Behavior

Edit the prompt body in `.github/workflows/triage-and-fix.md`. To add new write capabilities (e.g., posting comments), add the corresponding entry to `safe-outputs` and recompile.
