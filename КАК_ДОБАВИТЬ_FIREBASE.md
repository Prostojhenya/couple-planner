# 🔥 Как добавить Firebase в Vercel

## 🎯 Что нужно сделать

Тебе нужно добавить 6 переменных окружения в Vercel вручную. Я не могу это сделать автоматически, но вот точная инструкция:

---

## 📝 Шаг 1: Открой Vercel

Перейди: https://vercel.com/prostojhenyas-projects/couple-planner/settings/environment-variables

---

## 📝 Шаг 2: Открой JSON файл

Открой файл `tasktango-uuyq4-firebase-adminsdk-fbsvc-ea426e1b8d.json` из папки Downloads в любом текстовом редакторе (Блокнот, VS Code и т.д.)

---

## 📝 Шаг 3: Добавь переменные

Для каждой переменной нажми **"Add New"** в Vercel и заполни:

### 1️⃣ FIREBASE_PROJECT_ID
- **Name:** `FIREBASE_PROJECT_ID`
- **Value:** `tasktango-uuyq4`
- **Environments:** ✅ Production ✅ Preview ✅ Development

### 2️⃣ FIREBASE_PRIVATE_KEY_ID
- **Name:** `FIREBASE_PRIVATE_KEY_ID`
- **Value:** `ea426e1b8d361ad1321d38e6db824a90fa5c11ea`
- **Environments:** ✅ Production ✅ Preview ✅ Development

### 3️⃣ FIREBASE_PRIVATE_KEY
- **Name:** `FIREBASE_PRIVATE_KEY`
- **Value:** Скопируй из JSON файла поле `"private_key"` **ПОЛНОСТЬЮ** (с `-----BEGIN PRIVATE KEY-----` и `-----END PRIVATE KEY-----`)
- **Environments:** ✅ Production ✅ Preview ✅ Development

⚠️ Это самая длинная переменная, скопируй всё включая начало и конец!

### 4️⃣ FIREBASE_CLIENT_EMAIL
- **Name:** `FIREBASE_CLIENT_EMAIL`
- **Value:** `firebase-adminsdk-fbsvc@tasktango-uuyq4.iam.gserviceaccount.com`
- **Environments:** ✅ Production ✅ Preview ✅ Development

### 5️⃣ FIREBASE_CLIENT_ID
- **Name:** `FIREBASE_CLIENT_ID`
- **Value:** `110304382595328323748`
- **Environments:** ✅ Production ✅ Preview ✅ Development

### 6️⃣ FIREBASE_CLIENT_CERT_URL
- **Name:** `FIREBASE_CLIENT_CERT_URL`
- **Value:** `https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40tasktango-uuyq4.iam.gserviceaccount.com`
- **Environments:** ✅ Production ✅ Preview ✅ Development

---

## ⏳ Шаг 4: Дождись деплоя

После добавления всех переменных:
1. Vercel автоматически начнёт новый деплой
2. Зайди: https://vercel.com/prostojhenyas-projects/couple-planner
3. Дождись зелёного статуса "Ready" (2-3 минуты)

---

## ✅ Шаг 5: Проверь

Открой на iPhone: https://couple-planner-ten.vercel.app/api/debug/firebase-status

Должно показать:
```json
{
  "firebaseConfigured": true,
  "missingVars": []
}
```

Если всё ещё `false` - обнови страницу через минуту (деплой ещё не завершился).

---

## 🔄 Шаг 6: Переподпишитесь

После того как Firebase настроен, **оба** (ты и Женя) должны:

1. Настройки → Safari → Уведомления
2. Найти `couple-planner-ten.vercel.app` и удалить
3. Закрыть PWA полностью
4. Открыть PWA заново через иконку
5. Разрешить уведомления

---

## 🎉 Готово!

После этого push-уведомления будут работать на iPhone через Firebase!

---

## ❓ Если что-то не получается

Напиши мне:
- На каком шаге застрял
- Что показывает `/api/debug/firebase-status`
- Скриншот если нужно
