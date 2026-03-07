# ── Stage 1: base ───────────────────────────────────────────────
FROM node:22-alpine AS base
RUN npm install -g pnpm@10
RUN apk add --no-cache openssl
WORKDIR /app

# ── Stage 2: install dependencies ──────────────────────────────
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --no-frozen-lockfile

# ── Stage 3: build ─────────────────────────────────────────────
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN pnpm build

# ── Stage 4: production runner ─────────────────────────────────
FROM node:22-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app

ENV NODE_ENV=production

# Copy built output and production dependencies
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts

EXPOSE 3333

CMD ["node", "dist/server.js"]
