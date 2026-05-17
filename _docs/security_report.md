# 🔒 Ninco Security Audit Report

**Date:** 2026-05-17  
**Scope:** Full-stack security review — Backend (Fastify/Prisma), Frontend (Next.js/Clerk), Infrastructure (Docker/Caddy), CI/CD  
**Methodology:** Static code analysis, dependency auditing (`pnpm audit`), configuration review, and architectural analysis

---

## Executive Summary

The Ninco application has a **solid foundational security posture** — Clerk JWT authentication is correctly applied, Prisma ORM prevents SQL injection, webhook signatures are verified via Svix, and `.env` files are properly git-ignored. However, **several critical and high-severity issues** were identified that require immediate attention, primarily around secrets exposure, missing security headers, unprotected API routes, and outdated dependencies.

| Severity | Count | Status |
|----------|-------|--------|
| 🔴 **Critical** | 4 | Requires immediate action |
| 🟠 **High** | 6 | Should fix before next release |
| 🟡 **Medium** | 8 | Plan to address soon |
| 🔵 **Low** | 5 | Best-practice improvements |

---

## 🔴 Critical Findings

### C1. Hardcoded API Keys in Source Files

> [!CAUTION]
> **Real Clerk secret keys and Gemini API keys are hardcoded in `.env` files committed to the local workspace.** While `.env` files are git-ignored, the keys appear as literal values that could be leaked through backup tools, IDE sync, or shared workstations.

**Affected files:**
- [backend/.env](file:///c:/Micael/projects/ninco/backend/.env) — Contains `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`
- [frontend/.env.local](file:///c:/Micael/projects/ninco/frontend/.env.local) — Contains `CLERK_SECRET_KEY`, `GEMINI_API_KEY`

**Key concern:** The `CLERK_SECRET_KEY` (`sk_test_uoRnSAlQ6P47KWEcKmoqOV5PUIVPIdlangPkMPz4qb`) is present in **both** the backend and frontend env files. If this key leaks, an attacker can impersonate any user, access all user data, and modify accounts.

**Remediation:**
1. **Rotate all exposed keys immediately** — Regenerate Clerk secret key, webhook secret, and Gemini API key
2. Use a secrets manager (e.g., Doppler, Vault, or GitHub Secrets for CI) instead of local `.env` files
3. Ensure `.env.example` files contain only placeholder values (✅ already good)

---

### C2. Frontend Server-Side Route Has No Authentication

> [!CAUTION]
> The Next.js API routes at `/api/ai/parse-transaction` and `/api/ai/generate-report` **have no authentication checks**. Any request to these endpoints will be processed, consuming Gemini API credits and potentially leaking financial data.

**Affected files:**
- [parse-transaction/route.ts](file:///c:/Micael/projects/ninco/frontend/app/api/ai/parse-transaction/route.ts)
- [generate-report/route.ts](file:///c:/Micael/projects/ninco/frontend/app/api/ai/generate-report/route.ts)

**Risk:** An unauthenticated attacker can:
- Send unlimited requests to burn through Gemini API credits (cost abuse)
- Submit arbitrary data to the AI model (prompt injection)
- Extract financial patterns via the report generation endpoint

**Remediation:**
```typescript
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ... existing logic
}
```

---

### C3. Missing Next.js Middleware File

> [!CAUTION]
> The Clerk middleware is defined in `frontend/proxy.ts` instead of the Next.js-required `middleware.ts`. **Next.js only recognizes `middleware.ts` (or `.js`) at the project root.** This means the Clerk route protection **may not be active** — all routes could be publicly accessible.

**Affected file:** [proxy.ts](file:///c:/Micael/projects/ninco/frontend/proxy.ts)

**Remediation:**
- Rename `proxy.ts` to `middleware.ts` in the frontend root directory
- Verify by accessing a protected route (e.g., `/home`) while logged out — it should redirect to `/sign-in`

---

### C4. Debug Filesystem Writes in Production Code

> [!CAUTION]
> The webhook handler writes raw webhook payloads and error stacks to `C:\tmp\clerk_webhook.log` using `require('fs').appendFileSync()`. This is active in **all environments** including production.

**Affected file:** [clerk-sync.ts](file:///c:/Micael/projects/ninco/backend/src/modules/webhooks/clerk-sync.ts#L192-L236)

```typescript
// Line 192 — writes full webhook payload (contains user IDs, emails, subscription data)
require('fs').appendFileSync('C:\\tmp\\clerk_webhook.log', JSON.stringify({ type: eventType, data }) + '\n');
// Line 236 — writes full error stack traces
require('fs').appendFileSync('C:\\tmp\\clerk_webhook.log', 'ERROR: ' + err.stack + '\n');
```

**Risks:**
- PII (emails, user IDs) logged to an unprotected filesystem location
- Full stack traces leak internal implementation details
- File grows unbounded → potential disk exhaustion DoS
- Windows-specific path makes this a cross-platform failure

**Remediation:** Remove both `appendFileSync` lines entirely. Use the existing `request.log` structured logger instead.

---

## 🟠 High Findings

### H1. No Rate Limiting on Any Endpoint

> [!WARNING]
> The backend has **zero rate limiting** on any endpoint. The AI credit system provides a soft limit for AI usage, but all other endpoints (transactions, accounts, feedback, authentication) are completely unbounded.

**Impact:**
- Brute-force attacks against the webhook endpoint
- Denial-of-service via high-volume transaction creation
- Feedback endpoint abuse (email flooding)
- AI endpoint abuse (even with credit system, credits reset monthly)

**Remediation:**
```bash
pnpm --filter backend add @fastify/rate-limit
```
```typescript
import rateLimit from '@fastify/rate-limit';

app.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
});
```

---

### H2. Missing Account Ownership Validation on Transaction Creation

> [!WARNING]
> When creating a transaction, the `accountId` is accepted from the request body but **not validated to belong to the authenticated user**. An attacker with a valid JWT could modify another user's account balance.

**Affected file:** [create-transaction.ts](file:///c:/Micael/projects/ninco/backend/src/modules/transactions/create-transaction.ts#L30-L48)

The `userId` from the JWT is stored on the transaction, but the `accountId` is blindly trusted. Since the `Account` model doesn't enforce `userId` in the create query's WHERE clause, a user could target any account UUID.

**Remediation:** Add an ownership check before creating the transaction:
```typescript
const account = await prisma.account.findUnique({
  where: { id: accountId, userId },
});
if (!account) {
  return reply.status(404).send({ message: 'Account not found' });
}
```

---

### H3. 73 Known Dependency Vulnerabilities (5 Critical, 23 High)

> [!WARNING]
> `pnpm audit` reports **73 vulnerabilities** across the workspace, including 5 critical and 23 high severity issues.

| Package | Severity | Issue | Fix |
|---------|----------|-------|-----|
| `next` (16.1.6 pinned in root) | Critical/High | Multiple CVEs including CSRF bypass, DoS, cache poisoning | Upgrade to `>=16.2.5` |
| `axios` (1.15.0) | Low | Null byte injection (CVE in AxiosURLSearchParams) | Upgrade to `>=1.15.1` |
| `hono` (transitive via Prisma) | Moderate | Multiple issues including JWT validation bypass | Add override `"hono@<4.12.18": ">=4.12.18"` |
| `nodemailer` (8.0.4) | Low | SMTP command injection | Already at patched version |

**Root cause:** The root `package.json` pins `next` at `16.1.6` via a direct dependency while the override targets `16.1.7`. The root-level `"next": "16.1.7"` dependency conflicts with sub-packages still resolving to `16.1.6`.

**Remediation:**
1. Update root `package.json`: `"next": "16.2.5"` (or latest)
2. Update frontend `package.json`: `"next": "16.2.5"`
3. Update overrides to match the new version range
4. Run `pnpm update -r next` and `pnpm audit` to verify

---

### H4. No Security Headers (CSP, HSTS, X-Frame-Options)

> [!WARNING]
> Neither the backend nor the Caddy reverse proxy sends any security headers. The `helmet` package is listed as a dependency but **never imported or used**.

**Affected files:**
- [server.ts](file:///c:/Micael/projects/ninco/backend/src/server.ts) — no helmet import
- [Caddyfile](file:///c:/Micael/projects/ninco/Caddyfile) — no header directives

**Missing headers:**
- `Content-Security-Policy` — Prevents XSS and data injection
- `Strict-Transport-Security` — Enforces HTTPS
- `X-Frame-Options` — Prevents clickjacking
- `X-Content-Type-Options` — Prevents MIME sniffing
- `Referrer-Policy` — Controls referrer leakage

**Remediation (Caddyfile):**
```caddy
ninco.app {
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        Referrer-Policy "strict-origin-when-cross-origin"
    }
    reverse_proxy ninco-frontend:3000
}
```

---

### H5. Feedback Email Subject/Message Not Sanitized (HTML Injection)

> [!WARNING]
> User-supplied `subject` and `message` fields are directly interpolated into HTML email content without sanitization.

**Affected file:** [feedback.controller.ts](file:///c:/Micael/projects/ninco/backend/src/modules/feedback/feedback.controller.ts#L25-L31)

```typescript
const emailContent = `
  <h1>New Feedback Received</h1>
  <p><strong>From:</strong> ${userName} (${userEmail})</p>
  <p><strong>Subject:</strong> ${subject}</p>       // ← unsanitized
  <h2>Message:</h2>
  <p>${message.replace(/\n/g, '<br>')}</p>          // ← unsanitized
`;
```

A malicious user could inject `<script>` tags, `<img>` tags with tracking pixels, or redirect links into the admin's email.

**Remediation:** Escape HTML entities before interpolation:
```typescript
function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
```

---

### H6. Swagger UI Exposed in Production

> [!WARNING]
> The Swagger UI at `/docs` is registered unconditionally, making the full API schema publicly accessible in production.

**Affected file:** [server.ts](file:///c:/Micael/projects/ninco/backend/src/server.ts#L22-L35)

**Remediation:**
```typescript
if (env.NODE_ENV === 'development') {
  app.register(swagger, { ... });
  app.register(swaggerUi, { routePrefix: '/docs' });
}
```

---

## 🟡 Medium Findings

### M1. CORS Configuration Defaults to Broad Wildcard

The `CORS_ORIGINS` env variable defaults to `http://localhost:3000`. In production, if the env variable is misconfigured or set to `*`, all origins will be permitted.

**Remediation:** Add validation to reject wildcard (`*`) origins in production mode:
```typescript
CORS_ORIGINS: z.string().default('http://localhost:3000')
  .refine(val => env.NODE_ENV !== 'production' || !val.includes('*'), 
    'Wildcard CORS not allowed in production'),
```

---

### M2. `pnpm install --no-frozen-lockfile` in Dockerfiles

Both Dockerfiles use `--no-frozen-lockfile`, which allows dependency versions to drift between builds, potentially introducing supply-chain attacks.

**Affected files:**
- [backend/Dockerfile](file:///c:/Micael/projects/ninco/backend/Dockerfile#L10)
- [frontend/Dockerfile](file:///c:/Micael/projects/ninco/frontend/Dockerfile#L9)

**Remediation:** Use `--frozen-lockfile` in production Dockerfiles.

---

### M3. Backend Docker Image Runs as Root

The backend production container runs as `root` (no `USER` directive). The frontend correctly creates and uses a `nextjs` user.

**Affected file:** [backend/Dockerfile](file:///c:/Micael/projects/ninco/backend/Dockerfile#L19-L35)

**Remediation:**
```dockerfile
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 appuser
USER appuser
```

---

### M4. No Input Length Limits on Text Fields

Several Zod schemas accept unbounded strings:
- `description: z.string().optional()` — no max length
- `comments: z.string().optional()` — no max length
- `name: z.string()` — no max length

This enables oversized payloads that could exhaust memory or database storage.

**Remediation:** Add `.max()` constraints:
```typescript
description: z.string().max(500).optional(),
comments: z.string().max(2000).optional(),
name: z.string().min(1).max(100),
```

---

### M5. `limit` Query Parameter Unbounded (Pagination)

In [list-transactions.ts](file:///c:/Micael/projects/ninco/backend/src/modules/transactions/list-transactions.ts#L15), the pagination `limit` defaults to 10 but has no maximum. A user could request `?limit=999999` to dump their entire transaction history in one query, causing memory pressure.

**Remediation:**
```typescript
limit: z.coerce.number().default(10).max(100),
```

---

### M6. Tag/Category Ownership Not Validated on Transaction Creation

When creating a transaction with `tagIds` or `categoryId`, these IDs are not validated to belong to the authenticated user. While the data model includes `userId` on tags/categories, the query doesn't enforce it.

**Remediation:** Validate ownership of `categoryId` and `tagIds` before association.

---

### M7. AI Prompt Injection Risk

The AI API routes pass user-supplied `message` directly into the LLM prompt without sanitization. While the output is structured (JSON), a crafted message could manipulate the AI's behavior.

**Affected files:**
- [parse-transaction/route.ts](file:///c:/Micael/projects/ninco/frontend/app/api/ai/parse-transaction/route.ts#L82)

**Remediation:** Sanitize user input, enforce strict output parsing, and consider adding a content safety check.

---

### M8. `CLERK_SECRET_KEY` Present in Frontend Environment

The `CLERK_SECRET_KEY` is in `frontend/.env.local`. While it's a server-side env var (not `NEXT_PUBLIC_`), having it in the frontend directory creates confusion and increases the surface area for accidental exposure.

**Remediation:** Remove `CLERK_SECRET_KEY` from `frontend/.env.local` — the frontend should never need it directly. Clerk's `@clerk/nextjs` uses the publishable key for client-side and the secret key should only live in the backend.

---

## 🔵 Low Findings

### L1. PostgreSQL Port Exposed in Development Docker Compose

The development `docker-compose.yaml` maps port `5432:5432`, making the database accessible from the host network. The comment says "remove in production" but both dev and prod profiles use the same port mapping.

---

### L2. `continue-on-error: true` on CI Lint Step

The CI workflow ignores frontend lint failures, which could allow security-related lint rules (e.g., detecting `dangerouslySetInnerHTML`) to be bypassed.

**Affected file:** [ci.yml](file:///c:/Micael/projects/ninco/.github/workflows/ci.yml#L47)

---

### L3. Default Database Credentials (`docker`/`docker`)

The development database uses weak default credentials. While this is acceptable for local development, ensure production uses strong, unique credentials managed via secrets.

---

### L4. Frontend `chart.tsx` Uses `dangerouslySetInnerHTML`

The chart component at `frontend/components/ui/chart.tsx:83` uses `dangerouslySetInnerHTML`. While this appears to be from the shadcn/ui library and likely renders controlled content, it should be audited to ensure no user-supplied data flows into it.

---

### L5. No `dependabot.yml` or Automated Dependency Updates

While security overrides have been manually added to `package.json`, there is no automated dependency scanning configured in the GitHub repository.

**Remediation:** Add `.github/dependabot.yml`:
```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
```

---

## ✅ What's Working Well

| Area | Assessment |
|------|------------|
| **Authentication** | Clerk JWT verification with proper `preHandler` hook ✅ |
| **Webhook Security** | Svix signature verification on Clerk webhooks ✅ |
| **ORM Safety** | Prisma prevents SQL injection — no raw queries found ✅ |
| **Git Hygiene** | `.env` files properly git-ignored, no secrets in history ✅ |
| **Data Isolation** | Most queries correctly filter by `userId` ✅ |
| **Cascading Deletes** | Prisma schema has proper `onDelete: Cascade` rules ✅ |
| **Error Handling** | Global error handler prevents raw error leaks in production ✅ |
| **Env Validation** | Zod schema validates all required env vars at startup ✅ |
| **Docker Multi-Stage** | Both Dockerfiles use multi-stage builds correctly ✅ |
| **CI/CD Permissions** | GitHub workflows have minimal `contents: read` permissions ✅ |

---

## Remediation Priority

```mermaid
gantt
    title Remediation Roadmap
    dateFormat  YYYY-MM-DD
    section Immediate (This Week)
    C1 - Rotate exposed keys        :crit, c1, 2026-05-17, 1d
    C2 - Auth on AI API routes       :crit, c2, 2026-05-17, 1d
    C3 - Rename proxy.ts → middleware.ts :crit, c3, 2026-05-17, 1d
    C4 - Remove debug filesystem writes  :crit, c4, 2026-05-17, 1d
    section This Sprint
    H1 - Add rate limiting           :high, h1, 2026-05-19, 2d
    H2 - Account ownership checks   :high, h2, 2026-05-19, 1d
    H3 - Update dependencies         :high, h3, 2026-05-20, 2d
    H4 - Add security headers        :high, h4, 2026-05-21, 1d
    H5 - Sanitize email content      :high, h5, 2026-05-22, 1d
    H6 - Disable Swagger in prod     :high, h6, 2026-05-22, 1d
    section Next Sprint
    M1-M8 - Medium priority items    :med, m1, 2026-05-26, 5d
```
