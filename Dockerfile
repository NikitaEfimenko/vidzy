FROM node:22-bookworm-slim

# Устанавливаем зависимости для Chrome, Remotion и ffmpeg
RUN apt-get update && apt-get install -y \
    libnss3 \
    libdbus-1-3 \
    libatk1.0-0 \
    libgbm-dev \
    libasound2 \
    libxrandr2 \
    libxkbcommon-dev \
    libxfixes3 \
    libxcomposite1 \
    libxdamage1 \
    libatk-bridge2.0-0 \
    libpango-1.0-0 \
    libcairo2 \
    libcups2 \
    ffmpeg \
    && npm install -g pnpm

WORKDIR /app

# 1. Копируем файлы конфигурации (для кэширования)
COPY .npmrc package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# 2. Копируем ВСЕ package.json из монорепозитория
COPY packages/*/package.json ./packages/
COPY apps/*/package.json ./apps/

# 3. Устанавливаем зависимости с --frozen-lockfile
RUN pnpm install --frozen-lockfile

# 4. Копируем ВЕСЬ проект (после установки зависимостей)
COPY . .

# 5. Собираем все пакеты через TurboRepo
RUN pnpm run db:generate && pnpm run build

# 6. Убеждаемся, что Remotion Browser установлен
RUN npx remotion browser ensure

CMD ["pnpm", "run", "start"]