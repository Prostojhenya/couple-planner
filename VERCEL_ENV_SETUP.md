# 🔧 Настройка Firebase переменных в Vercel

## 📋 Пошаговая инструкция

### 1. Открой Vercel Dashboard

Перейди по ссылке: https://vercel.com/prostojhenyas-projects/couple-planner/settings/environment-variables

### 2. Добавь переменные

Нажми **"Add New"** для каждой переменной:

---

#### Variable 1: FIREBASE_PROJECT_ID

**Name:** `FIREBASE_PROJECT_ID`  
**Value:** `tasktango-uuyq4`  
**Environment:** Production, Preview, Development (выбери все)

---

#### Variable 2: FIREBASE_PRIVATE_KEY_ID

**Name:** `FIREBASE_PRIVATE_KEY_ID`  
**Value:** `ea426e1b8d361ad1321d38e6db824a90fa5c11ea`  
**Environment:** Production, Preview, Development (выбери все)

---

#### Variable 3: FIREBASE_PRIVATE_KEY

**Name:** `FIREBASE_PRIVATE_KEY`  
**Value:** Открой файл `tasktango-uuyq4-firebase-adminsdk-fbsvc-ea426e1b8d.json` в Downloads, найди поле `private_key` и скопируй его значение **ПОЛНОСТЬЮ** (включая `-----BEGIN PRIVATE KEY-----` и `-----END PRIVATE KEY-----`)

⚠️ **ВАЖНО**: Vercel автоматически обработает переносы строк, просто вставь как есть из JSON файла.

**Environment:** Production, Preview, Development (выбери все)

---

#### Variable 4: FIREBASE_CLIENT_EMAIL

**Name:** `FIREBASE_CLIENT_EMAIL`  
**Value:** `firebase-adminsdk-fbsvc@tasktango-uuyq4.iam.gserviceaccount.com`  
**Environment:** Production, Preview, Development (выбери все)

---

#### Variable 5: FIREBASE_CLIENT_ID

**Name:** `FIREBASE_CLIENT_ID`  
**Value:** `110304382595328323748`  
**Environment:** Production, Preview, Development (выбери все)

---

#### Variable 6: FIREBASE_CLIENT_CERT_URL

**Name:** `FIREBASE_CLIENT_CERT_URL`  
**Value:** `https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40tasktango-uuyq4.iam.gserviceaccount.com`  
**Environment:** Production, Preview, Development (выбери все)

---

### 3. Сохрани

После добавления всех 6 переменных Vercel автоматически начнёт новый деплой.

### 4. Дождись деплоя

Зайди на: https://vercel.com/prostojhenyas-projects/couple-planner

Дождись зелёного статуса "Ready" (обычно 2-3 минуты).

### 5. Проверь

Открой: https://couple-planner-ten.vercel.app/api/debug/firebase-status

Должно показать:
```json
{
  "firebaseConfigured": true,
  "missingVars": []
}
```

---

## 🎯 После настройки

Когда Firebase настроен:

1. **Оба пользователя** (Женя и Ольга) должны переподписаться:
   - Настройки → Safari → Уведомления
   - Удалить `couple-planner-ten.vercel.app`
   - Открыть PWA заново
   - Разрешить уведомления

2. **Проверить** что работает:
   - Создать задачу для партнёра
   - Уведомление должно прийти

---

## 💡 Подсказка

Если не хочешь вручную копировать каждую переменную, можешь:

1. Открыть JSON файл в текстовом редакторе
2. Скопировать значения оттуда
3. Вставить в Vercel

Главное - не забудь выбрать все три окружения (Production, Preview, Development) для каждой переменной!
