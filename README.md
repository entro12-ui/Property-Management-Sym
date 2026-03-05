# Property Management System

A full-featured property management system built with **Next.js**, **Tailwind CSS**, **PostgreSQL** (Render), and **NextAuth.js** (Auth.js) for email/password sign-in.

## Features

- **Building & Unit Management** – Add buildings (address, floors, parking, utilities), units (type, size, rent, lease dates, status)
- **Tenant Management** – Tenant profiles, business type, documents, emergency contact, move-in/out
- **Rent & Financial** – Invoices, due dates, payment recording (Cash, Bank, Mobile money), late penalty, outstanding balance
- **Reports** – Monthly income, building income, outstanding rent, expense tracking
- **Announcements** – Send to all tenants, selected building, maintenance/emergency/rent reminder
- **Maintenance** – Tenants submit requests with urgency; admin assigns technician and updates status
- **Role-based dashboards** – Super Admin, Building Owner, Property Manager, Accountant, Tenant

## Setup

### 1. Environment variables

Copy the example env and set your values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

- **DATABASE_URL** – Your PostgreSQL URL (e.g. Render; add `?sslmode=require` for Render).
- **NEXTAUTH_URL** – Your app URL (e.g. `http://localhost:3000` for dev).
- **NEXTAUTH_SECRET** – A random string for signing sessions (e.g. run `openssl rand -base64 32`).

### 2. Database

Install dependencies and apply schema:

```bash
npm install
npx prisma generate
npx prisma db push
```

Or use migrations for production:

```bash
npx prisma migrate dev --name add_nextauth
```

**Note:** Auth now uses a `password_hash` column on `User` (and no longer uses `supabase_id`). If you had existing users from Supabase, they will need to sign up again to set a password, or you can set a password hash manually in the DB.

### 3. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use **Sign up** to create an account (stored in your PostgreSQL `User` table with a hashed password). Then **Sign in** with the same email and password.

### 4. First admin user

New sign-ups get role **TENANT**. To make a user **Super Admin** or **Building Owner**, update the `User` row in the database (e.g. with Prisma Studio):

```bash
npx prisma studio
```

Set `role` to `SUPER_ADMIN` or `BUILDING_OWNER` for your user.

## Scripts

| Command        | Description                |
|----------------|----------------------------|
| `npm run dev`  | Start dev server           |
| `npm run build`| Generate Prisma + build    |
| `npm run start`| Start production server    |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push`      | Push schema to DB (no migrations) |
| `npm run db:migrate`   | Run migrations (production) |
| `npm run db:studio`    | Open Prisma Studio        |

## Tech stack

- **Next.js 16** (App Router)
- **Tailwind CSS**
- **Prisma** + PostgreSQL (Render)
- **NextAuth.js** (Credentials provider: email + password, bcrypt)

## Tenant profiles

Tenants are users with a linked **TenantProfile** and a **Unit**. To assign a tenant to a unit, create a `TenantProfile` with `userId` and `unitId`, and set the unit status to `OCCUPIED`. This can be done via Prisma Studio or a future “Assign tenant” admin UI.
# Property-Management-Sym
