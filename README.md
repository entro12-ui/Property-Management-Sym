# Property Management System

A professional Building Rental Management System built with **Next.js**, **Tailwind CSS**, **PostgreSQL**, and **NextAuth.js**.

## Features

- **Building & Room Management** – Ground floor + 8 floors, ~50 rooms, floor-wise grid view, occupancy tracking
- **Tenant Management** – Full profile, national ID, documents with versioning, room assignment history
- **Quarterly & Monthly Billing** – Generate rent invoices, payment tracking, receipts
- **Tenant Payment Proof Upload** – Tenants upload CBE/mobile banking receipt screenshots (JPG, PNG, PDF) or billing URLs from **My Invoices**
- **Payment Proof Review (Admin)** – Review queue on **Dashboard → Invoices**, link submissions to invoices, approve/reject, auto-record income
- **Receipt OCR (CBE)** – Extracts total ETB debited, payer name, payment date, and transaction ID from Commercial Bank of Ethiopia receipt screenshots
- **Income & Expense Modules** – Categorized income/expenses, approval workflow, receipt attachments
- **SMS Notifications** – Automated rent reminders (15d, 7d, due, overdue) via SMS Ethiopia
- **Financial Dashboard** – Charts, net profit, occupancy, cash flow, PDF/Excel export
- **Role-based access** – Super Admin, Building Owner, Property Manager, Accountant, Tenant

## Setup

### 1. Environment variables

```bash
cp .env.example .env.local
```

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_URL` | App URL (e.g. `http://localhost:3000`) |
| `NEXTAUTH_SECRET` | NextAuth session secret |
| `CRON_SECRET` | Protects `/api/cron/reminders` |
| `SMSETIOPIA_API_KEY` or `SMS_ETHIOPIA_API_KEY` | SMS Ethiopia API key (optional; can configure in dashboard) |
| `OPENAI_API_KEY` | Receipt OCR via OpenAI Vision (recommended for CBE screenshot scanning) |

Configure SMS in **Dashboard → SMS Settings** (message template, owner phone, alert schedule).

**Important:** Use a dedicated PostgreSQL database for this project. On Render free tier, wake the database from the Render dashboard if connections fail.

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

Create a tenant user separately (or assign an existing user the Tenant role) to test payment proof upload.

### 5. SMS reminders (cron)

Schedule daily:

```bash
curl -X POST http://localhost:3000/api/cron/reminders \
  -H "Authorization: Bearer $CRON_SECRET"
```

Without SMS credentials, messages are logged and marked sent in dev mode. Configure live delivery in **Dashboard → SMS Settings**.

## Payment proof workflow

Sample CBE receipt images for testing live in `Invoices-samples/` (`invoice 1.jpg` … `invoice 4.jpg`).

### Tenant (My Invoices)

1. Go to **Dashboard → My Invoices**
2. Upload a receipt image/PDF or paste a billing URL
3. Optionally link to a rent invoice, or submit as a **general payment**
4. Track status under **Your submitted proofs** (Pending review → Approved / Rejected)

### Admin (Invoices → Payment proof review)

1. Go to **Dashboard → Invoices** — pending proofs appear in the **Payment proof review** section
2. Click **Scan receipt** to extract amount, payer name, date, and transaction ID (requires `OPENAI_API_KEY`, or system `tesseract` CLI if installed)
3. Edit fields manually if needed → **Save details**
4. For general submissions: **Link to invoice** (select period/room)
5. Send draft invoices to tenants via **Send invoice to tenant** on the invoice detail page
6. Click **Approve & record income** — creates a **Rental** income entry, records payment on the linked invoice, and updates invoice status (Paid/Partial)

### Receipt extraction

The parser targets **Commercial Bank of Ethiopia** mobile banking confirmation screenshots and reads:

- **Total amount debited** (includes fees when present, e.g. `Total Amount Debited ETB …`)
- **Payer name** (e.g. `NATNAEL MEKURIA ZEWDU`)
- **Payment date** (e.g. `22-May-2026`)
- **Transaction ID** (e.g. `FT261423RG5T`)

OCR priority:

1. OpenAI Vision (`OPENAI_API_KEY` in `.env`)
2. System `tesseract` CLI (`sudo apt install tesseract-ocr`), if installed

If OCR is unavailable, admins can enter details manually before approval.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run db:sync` | Apply schema changes safely (payment proof extraction fields, etc.) |
| `npm run db:seed` | Seed Central Tower building |
| `npm run promote-admin` | Promote user to Super Admin |
| `npm run db:studio` | Open Prisma Studio |
| `node scripts/verify-payment-proof-upload.mjs` | Validate sample receipt JPGs and upload path |
| `node scripts/test-receipt-parser.mjs` | Test CBE receipt text parser (no OCR) |

## Export reports

From `/dashboard/reports`:

- **Excel/PDF** financial reports via export buttons
- **Tenant roster** export

API: `GET /api/reports/export?type=financial&format=pdf&year=2026`

## Troubleshooting

| Issue | What to do |
|-------|------------|
| `Can't reach database server` (Render) | Wake Postgres on Render dashboard; verify `DATABASE_URL` |
| Receipt scan finds nothing | Set `OPENAI_API_KEY`, or enter amount/details manually |
| Tenant sees no invoices | Admin must generate/send invoices (Draft → Sent) |
| Stale dev errors after updates | Stop dev server, delete `.next`, run `npm run dev` again |
