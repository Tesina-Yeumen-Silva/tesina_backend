FROM node:20.19.2-alpine3.21 AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20.19.2-alpine3.21 AS builder
WORKDIR /app
RUN apk add --no-cache openssl
COPY --from=deps /app/node_modules ./node_modules
COPY prisma ./prisma/
RUN npx prisma generate
COPY . .
RUN npm run build

FROM node:20.19.2-alpine3.21 AS runner
WORKDIR /app
RUN apk add --no-cache openssl
ENV NODE_ENV=production
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --only=production && npx prisma generate
COPY --from=builder /app/dist ./dist

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:4500/health || exit 1

EXPOSE 4500
USER node
CMD ["node", "dist/index.js"]