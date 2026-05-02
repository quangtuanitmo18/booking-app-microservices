# syntax=docker/dockerfile:1
# -------- Builder --------
FROM node:20.19.2-alpine AS builder
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY src/frontend/package.json src/frontend/package-lock.json* ./src/frontend/
WORKDIR /app/src/frontend
RUN npm ci

# Copy source code
WORKDIR /app
COPY src/frontend ./src/frontend

# Build Next.js
WORKDIR /app/src/frontend
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# -------- Runner --------
FROM node:20.19.2-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/src/frontend/package.json ./src/frontend/
COPY --from=builder /app/src/frontend/node_modules ./src/frontend/node_modules
COPY --from=builder /app/src/frontend/.next ./src/frontend/.next
COPY --from=builder /app/src/frontend/public ./src/frontend/public

WORKDIR /app/src/frontend
USER node

EXPOSE 3001
ENV PORT=3001

CMD ["npm", "start"]
