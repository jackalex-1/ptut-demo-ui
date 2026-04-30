# AGENTS.md

## Project Overview

This repository hosts `cbd-web-widget`, a Next.js App Router application for CBD Punjab's AI chatbot and voice-agent experience ("Rehbar").

Primary goals for agent contributions:
- Keep changes secure, minimal, and production-safe.
- Preserve privacy expectations documented in `./terms.md`.
- Maintain code clarity through small, well-typed, documented changes.

## Tech Stack And Runtime

- Framework: Next.js (`next` 16.x) with React 19.
- Language: TypeScript (`strict: true` in `./tsconfig.json`).
- Linting: ESLint with `eslint-config-next` core web vitals + TypeScript (`./eslint.config.mjs`).
- Package manager: prefer `pnpm` for commands in this document.

## Setup And Development Commands

Run from repository root:

```bash
pnpm install
pnpm dev
```

Other supported scripts from `./package.json`:

```bash
pnpm lint
pnpm build
pnpm start
```

## Required Verification Order

Always run checks in this order before finishing code changes:

```bash
pnpm lint
pnpm build
```

Reason: linting issues should be resolved first, then build/type integrity must pass.

## Agent Scope And Boundaries

Only modify files needed for the requested task.

## Out Of Scope (Do Not Modify)

- `.next/` (generated build artifacts and cache)
- `node_modules/` (package manager managed)
- Lockfiles by hand (`pnpm-lock.yaml`, `package-lock.json`)
  - Update lockfiles only via package manager operations.

Never add unrelated refactors while implementing user requests.

## Architecture Pointers

- Use App Router conventions in `app/`; do not introduce legacy `pages/` routing unless the codebase already requires it.
- Prefer Server Components by default; add `"use client"` only when interactivity or browser-only APIs are necessary.
- Use existing path alias patterns (`@/*`) defined in `./tsconfig.json`.
- Keep API configuration environment-driven; never hardcode deployment-specific hosts or secrets.

## TypeScript Rules (`strict: true`)

- No implicit `any`; explicitly type function parameters and important return values.
- Avoid non-null assertions (`!`) unless there is a clear, documented invariant.
- Add explicit return types on exported functions for readability and stability.
- Prefer narrow types and safe guards over broad casts.

## Naming And Structure Conventions

- React components: PascalCase file and symbol names.
- Utility helpers: camelCase names under `lib/` or `utils/` when applicable.
- Shared object contracts: prefer `interface` for object shapes, either co-located or under `types/`.
- Keep components focused; extract complex logic into reusable helpers/hooks.

## Secure Coding Requirements

- Never hardcode credentials, API keys, bearer tokens, or private URLs.
- Validate and sanitize all user-controlled input before use in prompts, requests, or rendering.
- Treat external API/model output as untrusted; validate assumptions before acting on it.
- Avoid dynamic code execution patterns and unsafe HTML rendering.
- Minimize dependency additions; justify security impact when adding new packages.

## Privacy And Data Handling Constraints

Align with `./terms.md` expectations:

- Do not log raw PII, full chat transcripts, or voice payloads to console/server logs unless explicitly required and approved.
- Prefer data minimization: collect/store only what is needed for the feature.
- Do not introduce data-sharing behaviors beyond stated policy intent.
- Ensure user-facing behavior does not imply legal/financial/technical advice from the AI system.
- Keep wording and flows consistent with non-binding informational responses and human handoff boundaries.

## Environment Variables

- Keep local secrets in `.env.local`; never commit `.env.local`.
- Only variables prefixed with `NEXT_PUBLIC_` are exposed to browser code.
- Validate required environment variables at startup paths to avoid silent runtime failures.
- If adding a new variable, document it in project docs and include safe fallback/error behavior.

## Testing And Verification Guidance

There is currently no dedicated `test` script in `./package.json`. Use:
- Linting (`pnpm lint`)
- Production build check (`pnpm build`)
- Manual smoke checks through `pnpm dev` for changed flows/components

When adding behavior with meaningful logic, add or update tests if/when a test harness is introduced.

## Pre-Commit Checklist

- [ ] `pnpm lint` exits with 0 errors.
- [ ] `pnpm build` completes without TypeScript/build errors.
- [ ] No generated artifacts (`.next/`, `node_modules/`) are staged.
- [ ] No secrets, tokens, or private endpoints are hardcoded.
- [ ] `.env.local` is not staged.
- [ ] Documentation is updated when behavior, policy text, or setup changes.

## Documentation Expectations

- Document non-obvious logic with concise comments near complex code paths.
- Update relevant markdown/docs when changing setup, architecture assumptions, or user-visible behavior.
- Keep explanations concrete and tied to actual files and scripts in this repository.

## Change Management Guidelines

- Keep diffs small and task-focused.
- Preserve existing behavior unless change is explicitly requested.
- Surface blockers and assumptions early instead of guessing.
- Avoid destructive git operations unless explicitly requested by the user.

## PR / Commit Notes Guidance

When preparing summaries:
- Explain why the change was needed.
- List key risk areas and mitigations.
- Include verification performed (`lint`, `build`, and manual checks).
