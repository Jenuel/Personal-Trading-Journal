FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev

FROM node:20-alpine AS runner

ENV NODE_ENV=production

WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=deps /app/node_modules ./node_modules

COPY src ./src
COPY package.json ./
USER appuser

EXPOSE 5000
CMD ["node", "src/server.js"]
