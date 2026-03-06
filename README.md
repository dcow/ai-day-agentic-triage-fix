# Agentic Triage & Implement

A demo of [GitHub Agentic Workflows](https://github.github.com/gh-aw/) powered by Claude. Three agents handle the full lifecycle from filed issue to reviewed PR — no human in the loop.

**Live app:** https://ai-day-agentic-triage-fix.vercel.app
**Slides:** `public/slides.pdf` (also served at `/slides.pdf`)

## Workflows

### `triage-and-implement` — triggered on issue opened

1. Classifies the issue: bug / enhancement / question / needs-more-info
2. For bugs and enhancements: reads relevant source code and attempts a high-confidence fix or implementation
3. Opens a PR with the fix and a regression test, or posts a comment explaining what it found and why it stopped
4. Labels the issue and posts a triage summary regardless of outcome

Defined in [`.github/workflows/triage-and-implement.md`](.github/workflows/triage-and-implement.md).

### `pr-risk-review` — triggered on PR opened

A skeptical senior engineer reads the full diff and surrounding context of every changed file — including PRs opened by the triage agent. Flags logic errors, edge cases, regressions, and security issues by severity:

- `high` → submits `REQUEST_CHANGES`, applies `risk:high` label
- `medium` / `low` → submits `COMMENT`, applies `risk:low` label
- Nothing found → *"No significant risks identified."*

Defined in [`.github/workflows/pr-risk-review.md`](.github/workflows/pr-risk-review.md).

### `pr-review` — triggered on `/fix` comment in a PR

Reads the diff and comment thread, makes exactly the requested change, pushes a commit to the PR branch, and replies in one sentence. Activated only when a PR comment starts with `/fix` (on a single line — multiline comments with `\r\n` after `/fix` won't trigger it).

Defined in [`.github/workflows/pr-review.md`](.github/workflows/pr-review.md).

## Secrets

| Secret | Purpose |
|--------|---------|
| `ANTHROPIC_API_KEY` | Claude API access |
| `GH_AW_GITHUB_TOKEN` | PAT used by agents for MCP GitHub access, pushing branches, and creating PRs. Needs: Contents (read/write), Issues (read/write), Pull requests (read/write), Workflows (read/write) |

## Example App

A simple todo list (Next.js + Tailwind) used as the target codebase. Logic lives in `lib/todos.ts`; UI in `app/page.tsx`.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
npm test
npm run lint
```

## Slides

`slides/slides.md` → `public/slides.pdf`. PDF is committed to the repo (Vercel can't generate it — Chrome not available in the build environment). Requires Chrome installed locally to regenerate.

```bash
nvm use            # Node 24 required — marp-cli breaks on Node 25+
npm run build:slides
git add public/slides.pdf && git commit -m "chore: regenerate slides"
```

## Workflow Development

```bash
gh aw compile                        # compile all .md → .lock.yml
gh aw compile pr-risk-review         # compile one workflow
gh aw validate                       # validate without writing
gh aw list                           # show status
```

Always run `gh aw compile` after editing a workflow markdown file. The `.lock.yml` files are what GitHub Actions actually runs — never edit them directly.
