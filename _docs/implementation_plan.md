# Security & Performance Remediation Plan (Sprint 2)

This plan addresses the remaining medium/low severity findings from the security audit, as well as several performance improvements regarding database indexing.

## User Review Required

> [!IMPORTANT]
> - **Linter Enforcement:** Enforcing the linter in CI (removing `continue-on-error: true`) might cause immediate CI failures if there are existing unaddressed linting errors. We will need to fix any existing lint errors (e.g. `dangerouslySetInnerHTML` in `chart.tsx`) as part of this step.
> - **Database Indexes:** Adding indexes will require generating a new Prisma migration and running `npx prisma migrate dev`. I will execute this automatically.

## Proposed Changes

---

### 1. Database Performance (Indexing)

Currently, the `Transaction`, `Account`, and `Category` tables lack indexes on frequently queried fields like `userId`. This causes sequential scans on large tables.

#### [MODIFY] `backend/prisma/schema/transaction.prisma`
Add composite index for transactions (usually queried by user and date):
```prisma
  tags        Tag[]           @relation("TagToTransaction")

+ @@index([userId, date])
+ @@index([accountId])
}
```

#### [MODIFY] `backend/prisma/schema/account.prisma`
```prisma
  transactions Transaction[]
+ @@index([userId])
}
```

#### [MODIFY] `backend/prisma/schema/category.prisma`
```prisma
  transactions Transaction[]
+ @@index([userId])
}
```

---

### 2. Docker Hardening (M2, M3)

#### [MODIFY] `backend/Dockerfile`
Ensure deterministic builds and run as a non-root user.
```diff
- RUN pnpm install --no-frozen-lockfile
+ RUN pnpm install --frozen-lockfile
...
  ENV NODE_ENV=production
  
+ RUN addgroup --system --gid 1001 nodejs
+ RUN adduser --system --uid 1001 appuser
+ 
  # Copy built output and production dependencies
- COPY --from=build /app/dist ./dist
- COPY --from=build /app/node_modules ./node_modules
- COPY --from=build /app/package.json ./package.json
- COPY --from=build /app/prisma ./prisma
- COPY --from=build /app/prisma.config.ts ./prisma.config.ts
+ COPY --from=build --chown=appuser:nodejs /app/dist ./dist
+ COPY --from=build --chown=appuser:nodejs /app/node_modules ./node_modules
+ COPY --from=build --chown=appuser:nodejs /app/package.json ./package.json
+ COPY --from=build --chown=appuser:nodejs /app/prisma ./prisma
+ COPY --from=build --chown=appuser:nodejs /app/prisma.config.ts ./prisma.config.ts
+ 
+ USER appuser
```

#### [MODIFY] `frontend/Dockerfile`
```diff
- RUN pnpm install --no-frozen-lockfile
+ RUN pnpm install --frozen-lockfile
```

---

### 3. Backend Input Validation & Pagination (M4, M5, M7)

#### [MODIFY] `backend/src/modules/transactions/list-transactions.ts`
Enforce an upper bound on pagination to prevent memory exhaustion.
```diff
-         limit: z.coerce.number().default(10),
+         limit: z.coerce.number().min(1).max(100).default(10),
```

#### [MODIFY] `backend/src/modules/transactions/create-transaction.ts`
Enforce max lengths on strings.
```diff
-         description: z.string().optional(),
-         comments: z.string().optional(),
+         description: z.string().max(255).optional(),
+         comments: z.string().max(2000).optional(),
```
*(Also apply to `update-transaction.ts`)*

#### [MODIFY] `frontend/app/api/ai/parse-transaction/route.ts`
Prevent massive prompt injections by limiting the incoming text size.
```diff
  export async function POST(request: NextRequest) {
    try {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
+     const body = await request.json() as RequestBody;
+     if (!body.message || body.message.length > 1000) {
+       return NextResponse.json({ error: 'Message is too long or missing' }, { status: 400 });
+     }
```

---

### 4. Tag/Category Ownership Validation (M6)

When creating or updating transactions, we must verify that the provided `categoryId` and `tagIds` actually belong to the authenticated `userId`.

#### [MODIFY] `backend/src/modules/transactions/create-transaction.ts`
```typescript
    // existing account ownership check
    
    if (categoryId) {
      const category = await prisma.category.findUnique({ where: { id: categoryId, userId } });
      if (!category) return reply.status(404).send({ message: 'Category not found' } as any);
    }

    if (tagIds && tagIds.length > 0) {
      const tags = await prisma.tag.findMany({ where: { id: { in: tagIds }, userId } });
      if (tags.length !== tagIds.length) return reply.status(404).send({ message: 'One or more tags not found' } as any);
    }
```
*(Also apply to `update-transaction.ts`)*

---

### 5. Infrastructure & CI Cleanups (L1, L2, L5)

#### [MODIFY] `docker-compose.yaml`
Bind the Postgres port to localhost only, rather than exposing it publicly.
```diff
    ports:
-     - "5432:5432"  # Expose PostgreSQL port for development  (remove in production)
+     - "127.0.0.1:5432:5432"
```

#### [MODIFY] `.github/workflows/ci.yml`
Stop bypassing the frontend linter.
```diff
      - name: Lint frontend
        run: pnpm --filter frontend lint
-       continue-on-error: true
```

#### [NEW] `.github/dependabot.yml`
Automate future dependency updates.
```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
```

## Verification Plan
1. **Automated Check:** Run `pnpm test` and `pnpm lint` locally to ensure the new linter enforcement and ownership validations don't break existing features.
2. **Database Verification:** Check `prisma/migrations` to ensure the new indexes are generated.
3. **Docker Verification:** Run `docker compose build ninco-backend` to verify the non-root setup builds correctly.
