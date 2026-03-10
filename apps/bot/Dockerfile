FROM node:22-slim AS deps

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/bot/package.json ./apps/bot/
COPY packages/shared/package.json ./packages/shared/

RUN npm ci --workspace=@freelance-hub/bot

# ---

FROM node:22-slim AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/bot/node_modules ./apps/bot/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules

COPY tsconfig.base.json ./
COPY packages/shared/ ./packages/shared/
COPY apps/bot/ ./apps/bot/

RUN npm run build --workspace=@freelance-hub/shared
RUN npm run build --workspace=@freelance-hub/bot

# ---

FROM node:22-slim AS runtime

RUN apt-get update && apt-get install -y --no-install-recommends dumb-init && rm -rf /var/lib/apt/lists/*

RUN groupadd -r bot && useradd -r -g bot -s /bin/false bot

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /app/apps/bot/node_modules ./apps/bot/node_modules
COPY --from=build /app/packages/shared/dist ./packages/shared/dist
COPY --from=build /app/apps/bot/dist ./apps/bot/dist
COPY packages/shared/package.json ./packages/shared/
COPY apps/bot/package.json ./apps/bot/
COPY package.json ./

RUN mkdir -p /app/apps/bot/data && chown -R bot:bot /app

USER bot

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "apps/bot/dist/index.js"]
