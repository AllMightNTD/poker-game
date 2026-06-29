# ======================
# Stage 1: Dependencies
# ======================
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --legacy-peer-deps

# ======================
# Stage 2: Development
# ======================
FROM node:20-alpine AS development

WORKDIR /app

ENV NODE_ENV=development

COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]

# ======================
# Stage 3: Builder
# ======================
FROM node:20-alpine AS builder

WORKDIR /app

ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ======================
# Stage 4: Production
# ======================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

CMD ["node", "server.js", "npm", "run", "dev"]