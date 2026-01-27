#!/bin/bash

# 🚀 Скрипт для применения изменений: Групповой планер
# Версия: 2.0.0
# Дата: 28 января 2026

echo "🎉 Обновление до группового планера"
echo "===================================="
echo ""

# Проверка Node.js
echo "📦 Проверка Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен!"
    exit 1
fi
echo "✅ Node.js установлен: $(node --version)"
echo ""

# Проверка npm
echo "📦 Проверка npm..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm не установлен!"
    exit 1
fi
echo "✅ npm установлен: $(npm --version)"
echo ""

# Проверка .env файла
echo "🔍 Проверка .env файла..."
if [ ! -f .env ]; then
    echo "❌ Файл .env не найден!"
    echo "Создайте файл .env на основе .env.example"
    exit 1
fi
echo "✅ Файл .env найден"
echo ""

# Установка зависимостей
echo "📦 Установка зависимостей..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Ошибка установки зависимостей!"
    exit 1
fi
echo "✅ Зависимости установлены"
echo ""

# Генерация Prisma Client
echo "🔧 Генерация Prisma Client..."
npx prisma generate
if [ $? -ne 0 ]; then
    echo "❌ Ошибка генерации Prisma Client!"
    exit 1
fi
echo "✅ Prisma Client сгенерирован"
echo ""

# Применение миграции БД
echo "🗄️  Применение миграции БД..."
echo "Вариант 1: Prisma Push (для dev)"
read -p "Применить миграцию? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx prisma db push
    if [ $? -ne 0 ]; then
        echo "❌ Ошибка применения миграции!"
        echo "Попробуйте вручную через SQL (см. QUICK_START.md)"
        exit 1
    fi
    echo "✅ Миграция применена"
else
    echo "⚠️  Миграция пропущена. Примените вручную!"
fi
echo ""

# Проверка компонента
echo "🎨 Проверка компонента GroupClusterIcon..."
if [ ! -f src/components/GroupClusterIcon.tsx ]; then
    echo "❌ Компонент GroupClusterIcon.tsx не найден!"
    exit 1
fi
echo "✅ Компонент найден"
echo ""

# Запуск dev-сервера
echo "🚀 Запуск dev-сервера..."
echo "Откройте http://localhost:3000 в браузере"
echo ""
echo "Проверьте:"
echo "  ✅ Иконка кластера в header"
echo "  ✅ Блок 'Группа' в настройках"
echo "  ✅ Можно пригласить до 5 участников"
echo ""
read -p "Запустить dev-сервер? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run dev
else
    echo "⚠️  Dev-сервер не запущен"
    echo "Запустите вручную: npm run dev"
fi

echo ""
echo "✅ Готово!"
echo ""
echo "📚 Документация:"
echo "  - UPDATE_README.md - обзор изменений"
echo "  - QUICK_START.md - быстрая инструкция"
echo "  - CHECKLIST.md - чек-лист проверки"
echo ""
echo "🎉 Приложение обновлено до версии 2.0.0!"
