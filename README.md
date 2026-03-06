# Agentic Triage & Implement

This repo demonstrates a [GitHub Agentic Workflow](https://github.github.com/gh-aw/) that automatically triages new issues and opens pull requests for confirmed bugs and well-scoped enhancements.

When an issue is opened, the workflow:
1. Classifies it as a bug, enhancement, question, or needs-more-info
2. For bugs and enhancements: reads the relevant source code and attempts a high-confidence implementation
3. Opens a PR if an implementation is ready, or posts a summary comment explaining its findings

The workflow is defined in [`.github/workflows/triage-and-implement.md`](.github/workflows/triage-and-implement.md) and runs on Claude Code.

## Example App

The repo includes a simple todo list app (Next.js + Tailwind) as a target codebase for testing the workflow. It's deployed at **https://ai-day-agentic-triage-fix.vercel.app**.

### Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app. The main page is `app/page.tsx` and utility logic lives in `lib/todos.ts`.

### Building

```bash
npm run build
```

### Slides

The presentation PDF (`public/slides.pdf`) is committed to the repo and served as a static asset. To regenerate it after editing `slides/slides.md`, you need [Chrome](https://www.google.com/chrome/) installed, then:

```bash
npm run build:slides
git add public/slides.pdf && git commit -m "chore: regenerate slides"
```

### Linting

```bash
npm run lint
```

## Workflow Development

The agentic workflow is managed with the [`gh aw`](https://github.com/github/gh-aw) CLI extension.

```bash
gh aw compile    # compile triage-and-implement.md → .lock.yml (run after any edits)
gh aw validate   # validate without writing lock files
gh aw list       # show workflow status
```

Edit `.github/workflows/triage-and-implement.md` to change how the agent behaves, then run `gh aw compile` to regenerate the lock file before pushing.
