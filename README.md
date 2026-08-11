# Task Tracker API

A small Express service for tracking a team's tasks (create/list/update/delete,
mark complete, filter by status). Built as a CI practice project — uses an
in-memory store so it runs anywhere with just Node.js, no external database.

## Local development

```bash
npm install
npm start              # runs on http://localhost:3000
```

## Testing & quality gates

```bash
npm run lint           # ESLint
npm test                # Jest unit tests + coverage report
```

## Docker

```bash
docker build -t task-tracker-api .
docker run -p 3000:3000 task-tracker-api
curl http://localhost:3000/health
```

## Note

This repo deliberately does NOT include a `.github/workflows/` file — write
your own as a CI knowledge exercise.
