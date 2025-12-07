# Dockerfile para GymRoutine App
FROM node:18-alpine AS base

# Instalar dependencias solo cuando sea necesario
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./
RUN npm ci

# Reconstruir el código fuente solo cuando sea necesario
FROM base AS builder
WORKDIR /app

# Declarar build arguments
ARG NEXT_PUBLIC_USE_API=false
ARG NEXT_PUBLIC_API_URL=http://localhost:3001

# Convertir build args a environment variables para el build
ENV NEXT_PUBLIC_USE_API=${NEXT_PUBLIC_USE_API}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Deshabilitar telemetría de Next.js durante el build
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Imagen de producción, copiar todos los archivos y ejecutar next
FROM base AS runner
WORKDIR /app

# Declarar build arguments para runtime
ARG NEXT_PUBLIC_USE_API=false
ARG NEXT_PUBLIC_API_URL=http://localhost:3001

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Configurar variables de API en runtime
ENV NEXT_PUBLIC_USE_API=${NEXT_PUBLIC_USE_API}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos públicos
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copiar archivos de build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
