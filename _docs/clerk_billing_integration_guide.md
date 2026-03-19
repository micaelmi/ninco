# Clerk Billing Integration Guide

This guide describes how to integrate **Clerk Billing** with the project
and synchronize subscription state with the database.

## Stack Context

-   Authentication: Clerk
-   Frontend: Next.js
-   Backend: Fastify
-   ORM: Prisma
-   Database: PostgreSQL

Clerk will be the **source of truth for subscriptions**, while the
database will maintain a synchronized user type (`normal` or `premium`).

------------------------------------------------------------------------

# 1. Create Pricing Page

Create a page that shows available plans configured in the Clerk
dashboard.

### File

    apps/web/app/pricing/page.tsx

### Implementation

``` tsx
import { PricingTable } from "@clerk/nextjs"

export default function PricingPage() {
  return (
    <div className="container">
      <h1>Pricing</h1>
      <PricingTable />
    </div>
  )
}
```

This component:

-   Shows plans configured in Clerk
-   Handles checkout automatically
-   Handles upgrades and downgrades

------------------------------------------------------------------------

# 2. Add Upgrade Button

Example component allowing users to upgrade.

### File

    apps/web/components/UpgradeButton.tsx

### Implementation

``` tsx
"use client"

import { useRouter } from "next/navigation"

export function UpgradeButton() {
  const router = useRouter()

  return (
    <button onClick={() => router.push("/pricing")}>
      Upgrade to Premium
    </button>
  )
}
```

------------------------------------------------------------------------

# 3. Add Billing Portal Button

Allow users to manage their billing subscription.

``` tsx
"use client"

import { redirectToBillingPortal } from "@clerk/nextjs"

export function ManageBillingButton() {
  return (
    <button onClick={() => redirectToBillingPortal()}>
      Manage Billing
    </button>
  )
}
```

This opens the Clerk billing portal.

------------------------------------------------------------------------

# 4. Create Webhook Endpoint

Create a webhook endpoint to listen to subscription updates from Clerk.

### File

    apps/api/src/routes/webhooks/clerk.ts

### Implementation

``` ts
import { FastifyInstance } from "fastify"

export async function clerkWebhookRoute(app: FastifyInstance) {
  app.post("/webhooks/clerk", async (request, reply) => {
    const event = request.body as any

    if (
      event.type === "subscription.created" ||
      event.type === "subscription.updated"
    ) {
      const userId = event.data.user_id
      const plan = event.data.plan

      const userType = plan === "premium" ? "premium" : "normal"

      await app.prisma.user.update({
        where: {
          clerkId: userId,
        },
        data: {
          userType,
        },
      })
    }

    if (event.type === "subscription.canceled") {
      const userId = event.data.user_id

      await app.prisma.user.update({
        where: {
          clerkId: userId,
        },
        data: {
          userType: "normal",
        },
      })
    }

    reply.send({ received: true })
  })
}
```

------------------------------------------------------------------------

# 5. Register Webhook Route

Register the webhook route in the Fastify server.

### File

    apps/api/src/server.ts

``` ts
import { clerkWebhookRoute } from "./routes/webhooks/clerk"

await app.register(clerkWebhookRoute)
```

------------------------------------------------------------------------

# 6. Configure Webhook in Clerk Dashboard

Open the Clerk dashboard and navigate to:

    Webhooks → Add Endpoint

Endpoint URL:

    https://api.yourdomain.com/webhooks/clerk

Subscribe to these events:

    subscription.created
    subscription.updated
    subscription.canceled

------------------------------------------------------------------------

# 7. Protect Premium Features

Premium features should verify the user's plan directly with Clerk.

### File

    apps/web/lib/checkPremium.ts

### Implementation

``` ts
import { auth } from "@clerk/nextjs/server"

export async function requirePremium() {
  const { has } = await auth()

  if (!has({ plan: "premium" })) {
    throw new Error("Premium plan required")
  }
}
```

------------------------------------------------------------------------

# 8. Example Usage

``` ts
await requirePremium()
```

Or UI-level gating:

``` tsx
{isPremium && <PremiumFeature />}
```

------------------------------------------------------------------------

# 9. Important Architecture Rule

Clerk is the **billing authority**.

Do not rely solely on the database value for authorization.

Correct flow:

    Clerk Billing
          ↓
    Clerk Webhook
          ↓
    Database sync (UserType)
          ↓
    Application checks Clerk plan

------------------------------------------------------------------------

# 10. Expected Flow

1.  User signs up → `UserType = normal`
2.  User upgrades via `/pricing`
3.  Clerk processes payment
4.  Webhook triggers
5.  Database updates

```{=html}
<!-- -->
```
    UserType → premium

6.  Premium features unlock.

------------------------------------------------------------------------

# End
