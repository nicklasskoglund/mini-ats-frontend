# Mini-ATS

A recruitment tool for managing jobs and candidates through a kanban-style
pipeline, with an AI-assisted CV assessment feature.

## Stack

- React + Vite + TypeScript
- Vitest + React Testing Library for unit tests
- Playwright for end-to-end tests

## Getting started

```bash
npm install
cp .env.example .env   # fill in the values
npm run dev
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build for production |
| `npm run lint` | Run the linter |
| `npm run test` | Run unit tests once |
| `npm run test:watch` | Run unit tests in watch mode |
| `npm run test:e2e` | Run end-to-end tests |

## Status

Authentication, the application shell, the recruitment kanban board, job
management, and candidate management (list, add, profile, edit, delete)
are in place. The candidate profile's AI assessment panel is a placeholder
until Step 6. Every other view is a "coming soon" placeholder.

## Roadmap

- [x] Authentication and application shell
- [x] Recruitment kanban board
- [x] Jobs
- [x] Candidates and candidate profile
- [ ] AI-assisted CV assessment
- [ ] Admin: customers and accounts
