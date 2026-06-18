# Property Management System

A professional Building Rental Management System built with **Next.js**, **Tailwind CSS**, **PostgreSQL**, and **NextAuth.js**.

## Features

- **Building & Room Management** – Ground floor + 8 floors, ~50 rooms, floor-wise grid view, occupancy tracking
- **Tenant Management** – Full profile, national ID, documents with versioning, room assignment history
- **Quarterly Billing** – Generate quarterly rent invoices (monthly rent × 3), payment tracking, receipts
- **Income & Expense Modules** – Categorized income/expenses, approval workflow, receipt attachments
- **SMS Notifications** – Automated rent reminders (15d, 7d, due, overdue) via SMS Ethiopia
- **Financial Dashboard** – Charts, net profit, occupancy, cash flow, PDF/Excel export
- **Role-based access** – Super Admin, Building Owner, Property Manager, Accountant, Tenant

## Setup

### 1. Environment variables

```bash
cp .env.example .env.local
```

Set `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`. Optionally configure SMS Ethiopia in the admin dashboard under **SMS Settings**, or via env vars (`SMSETIOPIA_API_KEY` / `SMS_ETHIOPIA_API_KEY`). Set `CRON_SECRET` for automated reminders.

**Important:** Use a dedicated PostgreSQL database for this project.

### 2. Database

```bash
npm install
npx prisma generate
npm run db:sync
```

`db:sync` safely adds new columns/tables **without** dropping unrelated data (use this instead of `db push` on shared databases).

For a **fresh dedicated database** only:

```bash
npx prisma db push
```

### 3. Seed the default building (50 rooms)

```bash
npm run db:seed
```

Creates **Central Tower** with ground floor + 8 floors (~50 rooms).

### 4. Run the app

```bash
npm run dev
```

Sign up at `/signup`, then promote to admin:

```bash
npm run promote-admin -- your@email.com
```

### 5. SMS reminders (cron)

Schedule daily:

```bash
curl -X POST http://localhost:3000/api/cron/reminders \
  -H "Authorization: Bearer $CRON_SECRET"
```

Without SMS credentials, messages are logged and marked sent in dev mode. Configure live delivery in **Dashboard → SMS Settings**.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run db:seed` | Seed Central Tower building |
| `npm run promote-admin` | Promote user to Super Admin |
| `npm run db:studio` | Open Prisma Studio |

## Export reports

From `/dashboard/reports`:
- **Excel/PDF** financial reports via export buttons
- **Tenant roster** export

API: `GET /api/reports/export?type=financial&format=pdf&year=2026`
