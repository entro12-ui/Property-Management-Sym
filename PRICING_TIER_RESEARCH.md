# Pricing Tier Research

## Executive recommendation

The current product is ready for a real three-tier commercial story, but only two of those tiers should be sold as feature-led software packages today.

- `Starter` should package the core operating system for small landlords and early-stage property managers.
- `Business` should hold the strongest software differentiation that already exists in the codebase: payment-proof OCR, centralized approvals, tenant documents, SMS automation, and richer reporting.
- `Enterprise` should be positioned as a custom commercial package for now, not as a heavily feature-gated software tier. The product does not yet show true organization tenancy, enterprise authentication, open API coverage, or deep accounting controls.

## Why this packaging fits the product

The repo already supports a strong operational baseline:

- Multi-building portfolio management
- Unit and occupancy tracking
- Tenant records and document storage
- Rent, electricity, and water invoicing
- Manual payments and payment-proof workflows
- Maintenance and leave requests
- Announcements and SMS reminders
- Tenant self-service portal
- Financial reporting and exports

The most differentiated value already implemented sits above the baseline and naturally belongs in `Business`:

- OCR-assisted payment-proof review
- Centralized approvals across multiple workflows
- Tenant document access and versioning
- SMS reminder settings and automated reminder jobs
- Income and expense workflows
- Better operational reporting and exports

The biggest blockers to a true enterprise software tier are:

- No organization or workspace tenancy model
- Credentials-only authentication, with no SSO, SAML, SCIM, or MFA
- No open API or clear external integration surface
- Finance is operational rather than enterprise-grade accounting

## Recommended package copy

### Starter

**Headline:** Core property operations for small portfolios.

**Copy:** Run your day-to-day property operations from one secure dashboard. Starter gives owners and small managers the essentials to manage buildings, units, tenants, invoices, maintenance requests, and tenant self-service without relying on spreadsheets.

**Include:**

- Buildings, units, and occupancy tracking
- Tenant records and room assignment
- Tenant portal basics
- Invoice creation for rent and utilities
- Manual payment recording
- Maintenance requests
- Standard dashboard views and basic reports

**Best fit:** Independent landlords, small owner-operators, and teams starting to formalize operations.

### Business

**Headline:** Automation and control for growing portfolios.

**Copy:** Business adds the workflows that reduce manual back-office work as your portfolio grows. It is the strongest product tier today because it packages the system's clearest differentiators: OCR payment-proof review, centralized approvals, SMS automation, document workflows, and richer financial oversight.

**Include everything in Starter, plus:**

- Payment-proof upload review with OCR-assisted extraction
- Central pending-approvals workbench
- Tenant document management
- Announcements and configurable SMS reminders
- Income and expense workflows
- PDF and Excel exports
- Accountant-friendly operational workflows

**Best fit:** Growing property managers with multiple buildings, more staff coordination, and higher billing volume.

### Enterprise

**Headline:** Custom rollout, governance, and support for larger operators.

**Copy:** Enterprise should currently be sold as a tailored commercial engagement for operators that need migration support, rollout planning, staff training, and priority service. It is a service-led tier today, with room to become a deeper platform tier once the product adds stronger tenancy, security, integrations, and finance controls.

**Safe inclusions today:**

- Everything in Business
- Custom onboarding and migration planning
- Dedicated training and rollout support
- Priority support and escalation handling
- Custom reporting and operating procedures
- Bilingual rollout support where needed

**Best fit:** Larger portfolios, multi-team operators, and customers who need implementation help more than additional software switches.

## Suggested commercial model

The repo supports service packaging more confidently than exact price points, so the best next step is a pricing model that matches portfolio complexity.

- `Starter`: flat monthly price, ideally capped by building count or unit count.
- `Business`: higher base price with unit-based or portfolio-based scaling.
- `Enterprise`: custom quote, annual terms, implementation fees or onboarding package, and optional service add-ons.

This follows the pattern used by comparable vendors:

- Buildium: transparent entry and growth tiers, with API and more advanced automation reserved for upper tiers.
- DoorLoop: starter-to-premium packaging, with deeper accounting and reporting in higher plans.
- AppFolio: scale-oriented and sales-led, with enterprise signals tied to automation, analytics, and operational control.

Reference URLs:

- https://www.buildium.com/pricing/
- https://www.doorloop.com/pricing
- https://stackcoast.com/appfolio-vs-buildium-vs-yardi/

## Enterprise gap scope

### 1. Organization and account tenancy

The current scoping model is centered on building ownership and manager assignment, not on a true company or workspace boundary. That is workable for small and mid-sized operations, but weak for enterprise-grade account isolation and administration.

Primary evidence:

- `src/lib/building-scope.ts`
- `prisma/schema.prisma`

### 2. Enterprise authentication and identity

Authentication is credentials-based NextAuth with JWT sessions. I did not find SSO, SAML, SCIM, MFA, or passkey support, which makes the current product hard to position as a mature enterprise platform.

Primary evidence:

- `src/lib/next-auth-options.ts`

### 3. API and integration surface

The product has strong internal workflows but no visible open API layer or major third-party finance integrations. That limits enterprise interoperability and makes "platform" positioning premature.

Primary evidence:

- `package.json`
- `src/app/actions/payment-proofs.ts`
- `src/app/actions/reports.ts`

### 4. Finance and control depth

The finance layer is useful for operations, but it is not yet enterprise accounting. I did not find chart-of-accounts structure, reconciliation flows, owner distributions, or broader audit-grade financial controls.

Primary evidence:

- `src/app/actions/financial.ts`
- `src/app/actions/income.ts`
- `src/app/actions/expenses.ts`
- `prisma/schema.prisma`

## Enterprise readiness sequence

If you want `Enterprise` to become a true software tier later, the cleanest build order is:

### Phase 1: account structure and identity

Build the foundations first:

- Organization or workspace model
- Stronger account-level data isolation
- Enterprise authentication requirements such as SSO and MFA

Without this layer, every other enterprise promise will feel partial.

### Phase 2: platform interoperability

After tenancy and identity, expand the product from an application into a platform:

- Open API coverage for key operational domains
- Integration hooks for finance and reporting workflows
- Cleaner audit trails around administrative and financial actions

This is the phase that makes Enterprise credible to larger operators with existing systems.

### Phase 3: finance and governance depth

Then deepen the back-office and compliance story:

- Stronger accounting structure and controls
- Broader financial statements and reconciliation workflows
- Governance-oriented reporting, role policies, and enterprise administration tools

This phase turns Enterprise from a service package into a more defensible platform tier.

## Evidence anchors

These are the most important files behind the recommendation:

- `README.md`
- `prisma/schema.prisma`
- `src/components/dashboard/Sidebar.tsx`
- `src/app/actions/buildings.ts`
- `src/app/actions/units.ts`
- `src/app/actions/tenants.ts`
- `src/app/actions/invoices.ts`
- `src/app/actions/payments.ts`
- `src/app/actions/payment-proofs.ts`
- `src/lib/receipt-extraction.ts`
- `src/app/actions/admin-notifications.ts`
- `src/app/api/cron/reminders/route.ts`
- `src/app/actions/reports.ts`
- `src/app/api/reports/export/route.ts`
- `src/lib/building-scope.ts`
- `src/lib/next-auth-options.ts`
- `src/app/actions/financial.ts`
