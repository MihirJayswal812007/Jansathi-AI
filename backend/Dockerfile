# ── Build stage ──────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies (cached layer)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source + Prisma schema
COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src

# Prisma generate needs a DATABASE_URL format (not a real connection).
# This placeholder is ONLY used for client codegen — never for DB access.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"

# Generate Prisma client + compile TypeScript
RUN npx prisma generate && npx tsc

# ── Production stage ─────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Production deps only
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy Prisma schema (needed for runtime client)
COPY prisma ./prisma

# Same placeholder — prisma generate only needs the URL format
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"
RUN npx prisma generate

# Remove placeholder — real DATABASE_URL comes from runtime env
ENV DATABASE_URL=""

# Copy compiled output from build stage
COPY --from=build /app/dist ./dist

# Set ownership
RUN chown -R appuser:appgroup /app

USER appuser

# Runtime config (real secrets injected by orchestrator / docker-compose)
ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/health || exit 1

CMD ["node", "dist/index.js"]
