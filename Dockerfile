# =========================
# 1️⃣ Builder stage
# =========================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install -g bun

RUN bun install

COPY . .

RUN bunx prisma@6.5.0 generate

RUN bun run build


# =========================
# 2️⃣ Runtime stage (kecil)
# =========================
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package.json ./

ENV NODE_ENV=production
ENV PORT=3000
ENV ADDRESS=0.0.0.0

EXPOSE 3000

CMD ["node", "dist/server.js"]