# Используем легковесный и безопасный образ Node.js
FROM node:20-alpine

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /usr/src/app

# Копируем package.json и package-lock.json для установки зависимостей
COPY package*.json ./

# Устанавливаем зависимости проекта
RUN npm install

# Копируем весь остальной код проекта в контейнер
COPY . .

# Собираем TypeScript в JavaScript (результат будет в /dist)
RUN npm run build

# Запускаем скомпилированный JavaScript, а не TypeScript
CMD ["npm", "start"]