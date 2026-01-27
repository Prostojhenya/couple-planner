@echo off
REM 🚀 Скрипт для применения изменений: Групповой планер
REM Версия: 2.0.0
REM Дата: 28 января 2026

echo 🎉 Обновление до группового планера
echo ====================================
echo.

REM Проверка Node.js
echo 📦 Проверка Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js не установлен!
    exit /b 1
)
node --version
echo ✅ Node.js установлен
echo.

REM Проверка npm
echo 📦 Проверка npm...
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm не установлен!
    exit /b 1
)
npm --version
echo ✅ npm установлен
echo.

REM Проверка .env файла
echo 🔍 Проверка .env файла...
if not exist .env (
    echo ❌ Файл .env не найден!
    echo Создайте файл .env на основе .env.example
    exit /b 1
)
echo ✅ Файл .env найден
echo.

REM Установка зависимостей
echo 📦 Установка зависимостей...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Ошибка установки зависимостей!
    exit /b 1
)
echo ✅ Зависимости установлены
echo.

REM Генерация Prisma Client
echo 🔧 Генерация Prisma Client...
call npx prisma generate
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Ошибка генерации Prisma Client!
    exit /b 1
)
echo ✅ Prisma Client сгенерирован
echo.

REM Применение миграции БД
echo 🗄️  Применение миграции БД...
echo Вариант 1: Prisma Push (для dev)
set /p APPLY_MIGRATION="Применить миграцию? (y/n): "
if /i "%APPLY_MIGRATION%"=="y" (
    call npx prisma db push
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Ошибка применения миграции!
        echo Попробуйте вручную через SQL (см. QUICK_START.md)
        exit /b 1
    )
    echo ✅ Миграция применена
) else (
    echo ⚠️  Миграция пропущена. Примените вручную!
)
echo.

REM Проверка компонента
echo 🎨 Проверка компонента GroupClusterIcon...
if not exist src\components\GroupClusterIcon.tsx (
    echo ❌ Компонент GroupClusterIcon.tsx не найден!
    exit /b 1
)
echo ✅ Компонент найден
echo.

REM Запуск dev-сервера
echo 🚀 Запуск dev-сервера...
echo Откройте http://localhost:3000 в браузере
echo.
echo Проверьте:
echo   ✅ Иконка кластера в header
echo   ✅ Блок 'Группа' в настройках
echo   ✅ Можно пригласить до 5 участников
echo.
set /p START_DEV="Запустить dev-сервер? (y/n): "
if /i "%START_DEV%"=="y" (
    call npm run dev
) else (
    echo ⚠️  Dev-сервер не запущен
    echo Запустите вручную: npm run dev
)

echo.
echo ✅ Готово!
echo.
echo 📚 Документация:
echo   - UPDATE_README.md - обзор изменений
echo   - QUICK_START.md - быстрая инструкция
echo   - CHECKLIST.md - чек-лист проверки
echo.
echo 🎉 Приложение обновлено до версии 2.0.0!
pause
