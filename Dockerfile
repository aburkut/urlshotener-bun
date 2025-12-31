FROM oven/bun:1.3.5-alpine AS base

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

EXPOSE 8080

CMD ["sh", "-c", "bunx prisma generate && bun run src/index.ts"]
