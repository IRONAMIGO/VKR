# ===========================
# Многоэтапная сборка: builder (node) -> production (nginx)
# ===========================

# --- Этап сборки Vite + Vue приложения ---
FROM node:26-alpine AS builder

WORKDIR /app

# Копируем файлы зависимостей и устанавливаем их
COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm npm ci

# Копируем исходный код и собираем статику
COPY . .
RUN npm run build

# --- Этап production-сервера ---
FROM nginxinc/nginx-unprivileged:alpine3.22 AS production

# Копируем кастомный конфиг для SPA (все запросы -> index.html)
COPY nginx.conf /etc/nginx/nginx.conf

# Копируем собранные файлы из builder-а
COPY --from=builder /app/dist /usr/share/nginx/html

# Запускаем nginx в foreground (единственный процесс)
CMD ["nginx", "-g", "daemon off;"]