FROM node:24-alpine AS base
RUN corepack enable
WORKDIR /build

FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/backend/package.json ./apps/backend/package.json
COPY packages/ui/package.json ./packages/ui/package.json
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json
COPY packages/eslint-config/package.json ./packages/eslint-config/package.json
RUN pnpm install --frozen-lockfile

FROM deps AS builder
COPY . .
RUN npx turbo build --filter=backend
RUN pnpm --filter backend deploy --prod /prod/backend

FROM gcr.io/distroless/nodejs24-debian13 AS runner
WORKDIR /app
COPY --from=builder /prod/backend ./

EXPOSE 3001
CMD ["dist/server.js"]