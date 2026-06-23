# Property Management System

A professional **building rental management platform** for multi-floor commercial and residential properties. Built with **Next.js 16**, **React 19**, **Tailwind CSS 4**, **PostgreSQL**, **Prisma**, and **NextAuth.js**.

Manage tenants, rooms, utility bills, expenses, SMS reminders, and financial reports in one secure dashboard — with a dedicated **tenant portal** for payment proofs, maintenance, and leave requests.

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js App Router, React 19, Tailwind CSS 4, Recharts |
| Backend | Next.js Server Actions, NextAuth.js |
| Database | PostgreSQL + Prisma ORM |
| Auth | Email/password (bcrypt), role-based access |
| SMS | SMS Ethiopia API (configurable in dashboard) |
| Receipt OCR | OpenAI Vision + CBE text parser (optional `tesseract` CLI fallback) |
| i18n | English + Amharic (አማርኛ) |

---

## Features

### Building & units

- Multi-building support with photos, floor plans, and occupancy overview
- Room/unit management by floor with grid view and status (Vacant, Occupied, Reserved, Maintenance)
- Quarterly rent due date per unit (drives invoice due dates and SMS reminders)
- Delete buildings and units from list pages (with confirmation)

### Tenant management

- Full tenant profiles, national ID, documents with versioning, room assignment history
- Assign users to units; track lease dates and move-in / move-out
- Tenant document library (lease, ID, agreements)

### Billing & invoices

- Invoice categories: **Rent**, **Electricity**, **Water**
- Invoice lifecycle: Draft → Sent → Partial / Paid / Overdue
- Create individual invoices from **Invoices → New invoice**
- Utility bills appear in the tenant **My Invoices** page (no separate utility page)

### Payment proof workflow

- Tenants upload CBE/mobile banking receipts (JPG, PNG, PDF) or billing URLs from **My Invoices**
- **Receipt OCR (CBE)** extracts total ETB debited, payer name, payment date, and transaction ID
- Admins review proofs on **Invoices → Payment proof review** or **Pending approvals**
- Approve → auto-records **Rental** income, payment on invoice, and updates invoice status
- Sample receipts for testing: `Invoices-samples/` (`invoice 1.jpg` … `invoice 4.jpg`)

### Pending approvals (admin)

Central hub at **Dashboard → Pending approvals** with badge notifications:

| Request type | Admin action |
|--------------|--------------|
| Payment proof | Scan receipt, approve/reject, link to invoice |
| Leave request | Approve/reject with optional admin notes |
| Maintenance | Accept (In Progress) or reject (Cancelled) |

Building Owners and Property Managers see leave and maintenance; Accountants see payment proofs only.

### Leave requests

- Tenants submit move-out requests with **2-month minimum notice**
- Admins review at **Leave requests** or **Pending approvals**
- Approval sets tenant move-out date on profile

### Maintenance

- Tenants and admins create maintenance requests with urgency levels
- Status workflow: Pending → In Progress → Completed / Cancelled
- Admin assignment, cost tracking, and detail pages

### Income & expenses

- Income types: Rental, Parking, Advance Payment, Deposit, Additional Charge, Other
- Expense categories with approval workflow and receipt attachments
- Financial dashboard: YTD income, net profit, occupancy, cash-flow chart

### SMS notifications

- Automated **rent-only** reminders: 15 days, 7 days, due today, overdue
- Announcement SMS to tenants (optional)
- SMS log viewer and settings (Super Admin / Building Owner)
- Cron endpoint: `/api/cron/reminders`

### Reports & export

- PDF and Excel financial reports from **Dashboard → Reports**
- Tenant roster export
- API: `GET /api/reports/export?type=financial&format=pdf&year=2026`

### Tenant portal

| Page | Purpose |
|------|---------|
| Dashboard | Room info, lease schedule, upcoming rent, payment proof status |
| Notifications | Rent alerts, proof updates, SMS history, announcements |
| My Invoices | Rent + electricity + water bills, upload payment proof |
| My Documents | Lease and ID documents on file |
| Maintenance | Submit and track repair requests |
| Leave request | Request to vacate (2-month notice) |
| My Profile | Contact details for SMS reminders |

### User management (Super Admin)

- **Dashboard → User management** — create accounts, assign roles, reset passwords
- Roles: Super Admin, Building Owner, Property Manager, Accountant, Tenant
- CLI fallback: `npm run promote-admin -- your@email.com`

### Localization

- Language switcher in dashboard header (English / Amharic)
- Flag icons and translated navigation labels

---

## User roles

| Role | Access summary |
|------|----------------|
| **Super Admin** | Full system access, user management, SMS settings |
| **Building Owner** | Own buildings, finances, SMS settings, approvals |
| **Property Manager** | Assigned buildings, tenants, invoices, approvals |
| **Accountant** | Invoices, income, expenses, reports, payment proof review |
| **Tenant** | Tenant portal only (invoices, proofs, maintenance, profile) |

---

## Setup

### 1. Environment variables

Create `.env.local` in the project root:

```bash
# Required
DATABASE_URL="postgresql://user:password@host:5432/dbname"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-long-random-string"

# Cron protection
CRON_SECRET="your-cron-secret"

# SMS (optional — can also configure in Dashboard → SMS Settings)
SMSETIOPIA_API_KEY=""
# or SMS_ETHIOPIA_API_KEY=""

# Receipt OCR (recommended for CBE screenshot scanning)
OPENAI_API_KEY=""
```

Configure SMS templates and owner phone in **Dashboard → SMS Settings**.

> **Note:** Use a dedicated PostgreSQL database. On Render free tier, wake the database from the Render dashboard if connections fail.

### 2. Install & database

```bash
npm install
npx prisma generate
npm run db:sync
```

`db:sync` safely adds new columns and tables **without** dropping unrelated data (preferred on shared databases).

For a **fresh dedicated database** only:

```bash
npx prisma db push
```

### 3. Seed sample building

```bash
npm run db:seed
```

Creates **Central Tower** with ground floor + 8 floors (~50 rooms).

### 4. Run the app

```bash
npm run dev
```

1. Sign up at `/signup`
2. Promote your account to Super Admin:

```bash
npm run promote-admin -- your@email.com
```

3. Sign out and sign back in to see the admin menu
4. Create staff users via **Dashboard → User management**, or assign the Tenant role and link a tenant profile to a unit

### 5. SMS reminders (cron)

Schedule daily (production) or run manually:

```bash
npm run sms:reminders
# or
curl -X POST http://localhost:3000/api/cron/reminders \
  -H "Authorization: Bearer $CRON_SECRET"
```

Without SMS credentials, messages are logged in dev mode. Only **rent** invoices trigger automated reminders.

---

## Deploying to Render

### Environment variables

In your Render web service **Environment** tab, set:

| Variable | Value |
|----------|--------|
| `DATABASE_URL` | Your Render PostgreSQL connection string |
| `NEXTAUTH_SECRET` | A long random string (keep stable across deploys) |
| `NEXTAUTH_URL` | `https://your-app-name.onrender.com` (your public URL, **no trailing slash**) |
| `AUTH_TRUST_HOST` | `true` (lets NextAuth use the Render request host for redirects) |
| `CRON_SECRET` | Random secret for scheduled reminder jobs |

> **Important:** If `NEXTAUTH_URL` is left as `http://localhost:3000`, sign-in will redirect to localhost instead of your Render URL. The app also sets `trustHost: true` so the request host is used when `NEXTAUTH_URL` is missing, but you should still set the production URL explicitly.

### Persistent file uploads

Uploaded receipts are stored on disk. On Render, the filesystem is **ephemeral** — files are lost on every redeploy unless you add a persistent disk:

1. In Render, add a **Disk** to your web service (e.g. mount path `/var/data`)
2. Set environment variable: `UPLOAD_DIR=/var/data/uploads`
3. Redeploy

Without a disk, tenants can upload proofs but files may disappear after the next deploy. **As of the latest version, uploads are stored in PostgreSQL** (`stored_files` table) so receipts survive redeploys without a disk. Run `npm run db:sync` after deploying this update.

### Build & start commands

Render usually auto-detects Next.js. If configuring manually:

- **Build command:** `npm install && npm run build`  
  (`npm run build` runs `prisma generate`, **`npm run db:sync`** to create/update tables such as `stored_files`, then `next build`)
- **Start command:** `npm start`

> **First deploy or after schema changes:** If uploads fail with `stored_files does not exist`, open the **Render Shell** for your web service and run `npm run db:sync`, then retry the upload. Future deploys run `db:sync` automatically during build.

After the first deploy, promote your admin account via Render shell or locally against the production DB:

```bash
npm run db:sync
npm run promote-admin -- your@email.com
```

---

## Key workflows

### Payment proof (tenant → admin)

**Tenant — My Invoices**

1. Open **Dashboard → My Invoices**
2. Select an invoice (or submit a general payment)
3. Upload receipt image/PDF or paste a billing URL
4. Track status under submitted proofs (Pending → Approved / Rejected)

**Admin — review**

1. **Pending approvals** (badge in sidebar/header), or **Invoices → Payment proof review**
2. Click **Scan receipt** to extract amount, payer, date, transaction ID
3. Edit fields manually if needed → **Save details**
4. For unlinked proofs: **Link to invoice**
5. **Approve & record income** — creates income entry, records payment, updates invoice status

### Leave request

1. Tenant: **Leave request** → pick move-out date (≥ 2 months ahead)
2. Admin: **Pending approvals** or **Leave requests** → Approve / Reject

### Maintenance

1. Tenant: **Maintenance → New request**
2. Admin: **Pending approvals** or **Maintenance** → accept, assign, update status

### Invoicing

1. **Invoices → New invoice** (rent, electricity, or water)
2. Open invoice detail → **Send invoice to tenant** (Draft → Sent)
3. Tenant sees it under **My Invoices** and can upload payment proof

---

## Receipt extraction (CBE)

Targets **Commercial Bank of Ethiopia** mobile banking confirmation screenshots:

| Field | Example |
|-------|---------|
| Total debited | ETB 5,668.40 |
| Payer name | NATNAEL MEKURIA ZEWDU |
| Payment date | 22-May-2026 |
| Transaction ID | FT261423RG5T |

OCR priority:

1. OpenAI Vision (`OPENAI_API_KEY`)
2. System `tesseract` CLI (`sudo apt install tesseract-ocr`), if installed
3. Manual entry by admin before approval

Test the text parser without OCR:

```bash
node scripts/test-receipt-parser.mjs
```

Validate sample uploads:

```bash
node scripts/verify-payment-proof-upload.mjs
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (runs `prisma generate` first) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:sync` | Apply incremental schema changes safely |
| `npm run db:seed` | Seed Central Tower building |
| `npm run db:studio` | Open Prisma Studio |
| `npm run promote-admin` | Promote user to Super Admin by email |
| `npm run sms:reminders` | Trigger rent reminder cron locally |

---

## Project structure

```
src/
├── app/
│   ├── (auth)/          # Login, signup
│   ├── (dashboard)/     # Protected dashboard routes
│   └── api/             # Cron, upload, report export
├── components/          # UI by domain (invoices, tenant, admin, …)
├── lib/                 # DB, auth, SMS, billing, serialization
├── i18n/                # English + Amharic translations
└── types/               # Shared labels and enums

prisma/schema.prisma     # Database models
scripts/                 # db:sync, seed, promote-admin, receipt tests
Invoices-samples/        # Sample CBE receipt images for testing
```

---

## Troubleshooting

| Issue | What to do |
|-------|------------|
| Redirect to `localhost:3000/login` after sign-in or sign-out (Render) | Set `NEXTAUTH_URL=https://your-app.onrender.com` and `AUTH_TRUST_HOST=true` in Render env vars, then redeploy. Sign-out also uses a relative redirect in code so it stays on your Render URL after deploy. |
| Uploaded receipts fail / `stored_files does not exist` | Run `npm run db:sync` in Render Shell (or redeploy with latest code — build runs `db:sync` automatically) |
| `Can't reach database server` (Render) | Wake Postgres on Render dashboard; verify `DATABASE_URL` |
| `Decimal objects are not supported` in dev | Restart dev server after updates; run `rm -rf .next && npm run dev` |
| Receipt scan finds nothing | Set `OPENAI_API_KEY`, or enter amount/details manually |
| Tenant sees no invoices | Admin must generate invoices and **Send invoice to tenant** (Draft → Sent) |
| Admin menu missing after promote | Sign out and sign back in |
| Stale errors after schema change | Run `npm run db:sync`, `npx prisma generate`, restart dev server |
| SMS not delivered | Check **SMS Settings** and API key; review **SMS Logs** |

---

## License

Private project — all rights reserved.
