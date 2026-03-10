FROM node:22-slim AS base

# Install dependencies for better-sqlite3
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy root workspace files
COPY package.json ./
COPY apps/bot/package.json ./apps/bot/
COPY packages/shared/package.json ./packages/shared/

RUN npm install --workspace=@freelance-hub/bot

# Copy source
COPY tsconfig.base.json ./
COPY packages/shared/ ./packages/shared/
COPY apps/bot/ ./apps/bot/

# Build
RUN npm run build --workspace=@freelance-hub/shared
RUN npm run build --workspace=@freelance-hub/bot

# Ensure data directory exists
RUN mkdir -p /app/apps/bot/data

CMD ["node", "apps/bot/dist/index.js"]
