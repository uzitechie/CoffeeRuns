# Coffee Runs (single Next.js host)

Frontend and backend are both in this Next.js app (`src/app` + `src/app/api`) with a SQL database through Prisma.

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Initialize SQL schema:

```bash
npm run db:push
```

3. Start the app:

```bash
npm run dev -- --hostname 127.0.0.1 --port 3000
```

4. Open `http://127.0.0.1:3000`.

## Database

- Prisma schema: `prisma/schema.prisma`
- Connection string: `.env` (`DATABASE_URL`)
- Default local SQL DB: SQLite (`prisma/dev.db`)

## Auth API routes (TypeScript)

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/session`
