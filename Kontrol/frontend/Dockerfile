# ============================================================
# Dockerfile - Frontend (Vue.js + Vite)
# Multi-stage build
# ============================================================

# --- Etapa 1: Build ---
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Etapa 2: Servir ---
FROM node:20-alpine

RUN npm install -g serve

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

COPY --from=builder /app/dist ./dist

USER appuser

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
