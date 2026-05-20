Billing Service

Purpose: handle billing provider webhooks and billing-related actions for tenants.

Setup:
- Configure your billing provider (Stripe/PayPal) and set webhook signing secret in environment:
  - `BILLING_WEBHOOK_SECRET`

Notes:
- The `/api/billing/webhook` route expects provider-specific verification. Implement verification using provider SDK.
- Webhooks should map events to tenants via `billing_customer_id` stored on the `tenants` table.

Example flow:
1. Billing provider sends `invoice.payment_succeeded` with a customer ID.
2. Lookup tenant by `billing_customer_id` and mark their subscription active.
3. Emit internal event or update tenant metadata.
