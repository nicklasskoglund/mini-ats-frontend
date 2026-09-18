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

Feature-complete for v1: authentication, the application shell, the
recruitment kanban board, job management, candidate management,
AI-assisted CV assessment, and admin account/customer management are all
in place, with a responsive mobile layout and empty/loading states across
every list. The account listing under "Kunder & konton" only supports
customer accounts for now - listing admin accounts shows a "coming soon"
placeholder, since the API has no endpoint for it yet.

## Roadmap

- [x] Authentication and application shell
- [x] Recruitment kanban board
- [x] Jobs
- [x] Candidates and candidate profile
- [x] AI-assisted CV assessment
- [x] Admin: customers, accounts, and profile settings
- [x] Responsive layout, empty/loading states, and accessibility polish
