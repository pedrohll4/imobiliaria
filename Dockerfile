# Dockerfile de Produção Otimizado (Multi-Stage Build)
# Gera uma imagem ultraleve (< 150MB) com segurança e alta performance

FROM node:20-alpine AS base

# 1. Dependências do Sistema
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Instala dependências do projeto
COPY package.json package-lock.json* ./
COPY prisma ./prisma/
RUN npm ci

# 2. Compilação (Builder)
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Desativa telemetria durante o build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Gera o Prisma Client e compila a aplicação Next.js
RUN npx prisma generate
RUN npm run build

# 3. Imagem Final de Execução (Runner)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Cria usuário não-root para segurança corporativa
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copia arquivos estáticos e bundle standalone
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs

EXPOSE 3000

# Inicia o servidor Node.js otimizado
CMD ["node", "server.js"]
