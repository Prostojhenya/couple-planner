# 🚀 Настройка ngrok для тестирования на iPhone

## Шаг 1: Регистрация на ngrok (бесплатно)

1. Перейдите на https://ngrok.com/
2. Нажмите "Sign up" (или "Get started for free")
3. Зарегистрируйтесь через email или GitHub

## Шаг 2: Получите authtoken

1. После входа перейдите на https://dashboard.ngrok.com/get-started/your-authtoken
2. Скопируйте ваш authtoken (выглядит как: `2abc123def456ghi789jkl`)

## Шаг 3: Настройте ngrok

Выполните команду (замените YOUR_AUTHTOKEN на ваш токен):

```bash
ngrok config add-authtoken YOUR_AUTHTOKEN
```

Пример:
```bash
ngrok config add-authtoken 2abc123def456ghi789jkl
```

## Шаг 4: Запустите туннель

```bash
ngrok http 3000
```

Вы увидите что-то вроде:

```
ngrok

Session Status                online
Account                       your-email@example.com
Version                       3.x.x
Region                        United States (us)
Latency                       50ms
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok.io -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

## Шаг 5: Скопируйте HTTPS URL

Найдите строку "Forwarding" и скопируйте HTTPS URL (например: `https://abc123.ngrok.io`)

## Шаг 6: Обновите .env

Откройте файл `.env` и обновите:

```env
NEXTAUTH_URL="https://abc123.ngrok.io"
```

**ВАЖНО:** Замените `abc123` на ваш реальный URL!

## Шаг 7: Перезапустите dev-сервер

```bash
# Остановите текущий сервер (Ctrl+C)
npm run dev
```

## Шаг 8: Тестирование на iPhone

### На iPhone:

1. **Откройте Safari**
2. **Перейдите на ваш ngrok URL** (например: `https://abc123.ngrok.io`)
3. **Войдите в систему:**
   - Email: `test@test.com`
   - Пароль: `test1234`
4. **Установите как PWA:**
   - Нажмите кнопку "Поделиться" (квадрат со стрелкой вверх)
   - Прокрутите вниз и выберите "На экран «Домой»"
   - Нажмите "Добавить"
5. **Запустите приложение:**
   - Найдите иконку на домашнем экране
   - Нажмите на неё
6. **Разрешите уведомления:**
   - Появится запрос на разрешение уведомлений
   - Нажмите "Разрешить"

### Проверка:

1. **На компьютере запустите тест:**
   ```bash
   node test-push-notification.js
   ```

2. **На iPhone должно прийти тестовое уведомление!** 🎉

## Шаг 9: Проверка настроек iOS

Если уведомления не приходят:

1. **Настройки → Уведомления → [Ваше приложение]**
2. Убедитесь, что:
   - ✅ Разрешить уведомления: ВКЛ
   - ✅ Звуки: ВКЛ
   - ✅ Баннеры: ВКЛ

## 🔍 Troubleshooting

### ngrok не запускается:
```bash
# Проверьте, что authtoken настроен:
ngrok config check

# Если нет, добавьте снова:
ngrok config add-authtoken YOUR_AUTHTOKEN
```

### "ERR_NGROK_108" или "Session Expired":
- Бесплатный план ngrok имеет ограничения
- Туннель автоматически закрывается через 2 часа
- Просто перезапустите: `ngrok http 3000`
- URL изменится, обновите `.env`

### Приложение не открывается на iPhone:
- Проверьте, что используете HTTPS URL (не HTTP)
- Проверьте, что dev-сервер запущен
- Проверьте, что ngrok туннель активен

### Уведомления не приходят:
1. Проверьте версию iOS (должна быть 16.4+)
2. Убедитесь, что приложение установлено как PWA
3. Проверьте настройки уведомлений в iOS
4. Запустите тест: `node test-push-notification.js`

## 💡 Полезные команды

```bash
# Запустить ngrok
ngrok http 3000

# Запустить с определённым регионом
ngrok http 3000 --region eu

# Посмотреть статус туннелей
curl http://localhost:4040/api/tunnels

# Открыть веб-интерфейс ngrok
# Перейдите в браузере: http://localhost:4040
```

## 📱 Альтернативы ngrok

Если ngrok не работает, попробуйте:

1. **localtunnel:**
   ```bash
   npx localtunnel --port 3000
   ```

2. **Cloudflare Tunnel:**
   ```bash
   npx cloudflared tunnel --url http://localhost:3000
   ```

3. **Deploy на Vercel (рекомендуется для production):**
   ```bash
   npm install -g vercel
   vercel
   ```

## 🎯 Следующие шаги

После успешной настройки:

1. ✅ Протестируйте уведомления на iPhone
2. ✅ Создайте задачу для партнёра
3. ✅ Проверьте, что уведомление приходит
4. ✅ Для production используйте Vercel/Netlify вместо ngrok

## 📚 Дополнительная информация

- Официальная документация: https://ngrok.com/docs
- Бесплатный план: 1 туннель, автоматическое закрытие через 2 часа
- Платный план: постоянные URL, больше туннелей, без ограничений
