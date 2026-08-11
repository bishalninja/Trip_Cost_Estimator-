# Cost Estimator

React + Vite + Tailwind + React Hook Form + Axios frontend,
Node.js + Express + Prisma + MySQL backend.

```
cost-estimator/
  client/   React app (port 5173)
  server/   Express API (port 4000)
```

## 1. Database — MySQL

You need a running MySQL server. Easiest local option (Docker):

```bash
docker run --name cost-estimator-mysql -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=cost_estimator -p 3306:3306 -d mysql:8
```

No Docker? Install MySQL locally (`brew install mysql` / apt / MySQL
installer) and create the database yourself:

```sql
CREATE DATABASE cost_estimator;
```

## 2. Backend

```bash
cd server
npm install                          # postinstall runs `prisma generate`
cp .env.example .env                 # edit DATABASE_URL if your creds differ
npx prisma migrate dev --name init   # creates the `loads` table
npm run dev                          # http://localhost:4000
```

Browse/edit data visually any time:
```bash
npm run prisma:studio
```

**Architecture** (unchanged from before, still layered):
```
routes/      -> maps HTTP path to a controller (no logic)
controllers/ -> handles req/res, calls the service (no DB code)
services/    -> the only place that talks to Prisma/MySQL
prisma/schema.prisma -> single source of truth for the table shape
```

## 3. Frontend

```bash
cd client
npm install
cp .env.example .env      # VITE_API_URL, defaults to localhost:4000/api
npm run dev                # http://localhost:5173
```

**What changed from the plain-fetch version:**
- **Axios** (`src/lib/axios.ts`) replaces raw `fetch` — one configured
  instance (`baseURL`, headers) used everywhere via `src/lib/loadsStore.ts`.
- **React Hook Form** (`src/hooks/useEstimatorForm.ts`) now owns all form
  state, validation, and dirty/valid tracking — `VehicleForm.tsx` and
  `TripForm.tsx` use `register()` instead of manual `value`/`onChange`
  props, and required-field errors show inline under each input instead
  of just disabling the Save button.
- **Tailwind** utility classes throughout (already were, kept as-is).

## 4. Folder map (matches your existing tree)

```
client/src/
  components/common/     Card, Input, Select (RHF-aware: accept `error`)
  components/estimator/  VehicleForm, TripForm, ResultPanel
  components/layout/     MainLayout, Navbar, Sidebar
  pages/                 Estimator, History, Dashboard*, Reports*
  routes/index.tsx       React Router config
  hooks/                 useEstimatorForm (RHF + live calc)
  lib/                   axios.ts, loadsStore.ts, calculations.ts
  types/                 estimator.ts

server/
  prisma/schema.prisma   Load model (MySQL)
  src/routes/            loads.js
  src/controllers/       loadsController.js
  src/services/          loadsService.js  (only file touching Prisma)
  src/middleware/        validateLoad.js
  index.js               entrypoint
```
`*` Dashboard and Reports are stubs — tell me what they should show and
I'll build them against `/api/loads`.

## 5. Deploying later (Render/Railway)

1. Spin up their managed MySQL/Postgres add-on → you get a `DATABASE_URL`.
2. Set that as the server's `DATABASE_URL` env var.
3. Run `npx prisma migrate deploy` (not `migrate dev`) as your deploy step
   — applies your existing migration history to the new DB.
4. Point the client's `VITE_API_URL` at the deployed server's URL and
   rebuild (`npm run build`).
