# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

FROM dependencies AS builder
ENV NEXT_TELEMETRY_DISABLED=1 DOCKER_BUILD=1
COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3009 HOSTNAME=0.0.0.0
COPY --from=builder --chown=node:node /app/.next-production/standalone ./
COPY --from=builder --chown=node:node /app/.next-production/static ./.next-production/static
COPY --from=builder --chown=node:node /app/public ./public
COPY --chown=node:node docker/entrypoint.cjs docker/healthcheck.cjs ./docker/
USER node
EXPOSE 3009
HEALTHCHECK --interval=15s --timeout=8s --start-period=30s --retries=5 CMD ["node", "docker/healthcheck.cjs"]
CMD ["node", "docker/entrypoint.cjs"]
