# =========================
# 1️⃣ Builder
# =========================
FROM oven/bun:1.3.5 AS builder

WORKDIR /app

# copy lockfile + manifest dulu (biar cache efisien)
COPY package.json ./

RUN bun install

# copy source
COPY . .

# generate prisma client
RUN bunx prisma@6.5.0 generate

# build typescript
RUN bun run build


# =========================
# 2️⃣ Runtime (kecil)
# =========================
FROM oven/bun:1.3.5-slim

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package.json ./

ENV NODE_ENV=production
ENV PORT=3000
ENV ADDRESS=0.0.0.0

EXPOSE 3000

CMD ["bun", "start"]
