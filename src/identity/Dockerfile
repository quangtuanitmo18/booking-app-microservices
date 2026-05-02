# syntax=docker/dockerfile:1
# -------- Builder --------
FROM node:20.19.2-alpine AS builder
WORKDIR /app

# Copy package files first for better layer caching
COPY src/building-blocks/package*.json ./src/building-blocks/
COPY src/identity/package*.json ./src/identity/

# Install building-blocks dependencies (needed for TypeScript compilation)
WORKDIR /app/src/building-blocks
RUN npm install

# Install identity dependencies
WORKDIR /app/src/identity
RUN npm install

# Copy source code (after install so code changes don't invalidate install cache)
WORKDIR /app
COPY src/building-blocks ./src/building-blocks
COPY src/identity ./src/identity

# Compile building-blocks first
WORKDIR /app/src/building-blocks
RUN npm run build

# Build
WORKDIR /app/src/identity
RUN npm run build

# -------- Runner --------
FROM node:20.19.2-alpine AS runner
WORKDIR /app

ENV NODE_ENV=docker

# Copy package files first
COPY src/identity/package*.json ./

# Install only production deps
RUN npm ci --omit=dev && npm cache clean --force

# Copy build artifacts
COPY --from=builder /app/src/identity/dist ./dist

# Copy building-blocks to node_modules (so it's resolvable at runtime)
COPY --from=builder /app/src/building-blocks ./node_modules/building-blocks

# Run as non-root user for security
USER node

EXPOSE 3333
CMD ["node", "dist/src/main.js"]