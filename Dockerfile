FROM node:22-bookworm-slim

# Устанавливаем зависимости для системы
RUN apt-get update && apt-get install -y \
    libnss3 libdbus-1-3 libatk1.0-0 libgbm-dev libasound2 \
    libxrandr2 libxkbcommon-dev libxfixes3 libxcomposite1 \
    libxdamage1 libatk-bridge2.0-0 libpango-1.0-0 libcairo2 \
    libcups2 ffmpeg \
    && npm install -g pnpm

WORKDIR /app

# 1. Копируем файлы конфигурации и lock-файлы
COPY .npmrc package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# 2. Копируем ВСЕ package.json (для правильного разрешения зависимостей)
COPY packages/*/package.json ./packages/
COPY apps/*/package.json ./apps/

# 3. Копируем весь исходный код (чтобы зависимости установились корректно)
COPY . .

# 4. Устанавливаем зависимости
RUN pnpm install --frozen-lockfile

# Проверяем, что модуль @vidzy/database установлен
RUN pnpm list @vidzy/database

# 5. Собираем проект через TurboRepo
RUN pnpm run db:generate && pnpm run build

# 6. Устанавливаем браузер для Remotion (если нужно)
RUN npx remotion browser ensure

CMD ["pnpm", "run", "start"]
