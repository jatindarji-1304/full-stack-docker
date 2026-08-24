FROM node:24-alpine AS base
RUN corepack enable
WORKDIR /build

FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/frontend/package.json ./apps/frontend/package.json
COPY packages/ui/package.json ./packages/ui/package.json
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json
COPY packages/eslint-config/package.json ./packages/eslint-config/package.json
RUN pnpm install --frozen-lockfile

FROM deps AS builder
COPY . .
RUN npx turbo build --filter=frontend

FROM gcr.io/distroless/nodejs24-debian13 AS runner
WORKDIR /app
COPY --from=builder /build/apps/frontend/.next/standalone ./
COPY --from=builder /build/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=builder /build/apps/frontend/public ./apps/frontend/public

EXPOSE 3000
CMD ["apps/frontend/server.js"]