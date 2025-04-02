# Используем официальный образ Node.js на Debian Bookworm (имеет glibc >= 2.36)
FROM node:22-bookworm-slim

# Устанавливаем необходимые зависимости для Chrome, Remotion и ffmpeg
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
    # Устанавливаем PNPM (если нет в образе)
    && npm install -g pnpm

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы, необходимые для установки зависимостей
COPY .npmrc package.json pnpm-lock.yaml* pnpm-workspace.yaml turbo.json ./

# Копируем все package.json из монорепозитория (если используется TurboRepo)
COPY packages/*/package.json ./packages/
COPY apps/*/package.json ./apps/

# Устанавливаем зависимости с --frozen-lockfile
RUN pnpm install --frozen-lockfile

# Копируем остальные файлы проекта
COPY . .

# Генерируем Prisma клиент и собираем проект
RUN pnpm run db:generate && pnpm run build

# Убеждаемся, что браузер для Remotion установлен
RUN npx remotion browser ensure

# Команда для запуска приложения
CMD ["pnpm", "run", "start"]