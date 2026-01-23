# 🍎 Настройка Safari Web Push для iOS

## ✅ У тебя уже есть Apple Developer аккаунт!

Теперь нужно создать Safari Web Push ID и настроить в OneSignal.

---

## 📝 Шаг 1: Создай Website Push ID

1. Открой: https://developer.apple.com/account/resources/identifiers/list
2. Нажми **"+"** (плюс) возле Identifiers
3. Выбери **"Website Push IDs"** → Continue
4. Заполни:
   - **Description:** `Couple Planner Push Notifications`
   - **Identifier:** `web.com.coupleplanner.push`
5. Нажми **Continue → Register**

---

## 🔐 Шаг 2: Создай сертификат

### 2.1 Создай Certificate Signing Request (CSR)

**На Mac:**
1. Открой **Keychain Access** (Связка ключей)
2. Меню → **Certificate Assistant** → **Request a Certificate from a Certificate Authority**
3. Заполни:
   - **User Email Address:** твой email
   - **Common Name:** `Couple Planner Push`
   - **Request is:** Saved to disk
4. Нажми **Continue** → сохрани файл `CertificateSigningRequest.certSigningRequest`

**На Windows:**
Используй OpenSSL:
```bash
openssl req -new -newkey rsa:2048 -nodes -keyout push.key -out push.csr
```

### 2.2 Создай сертификат на Apple Developer

1. Вернись в список Identifiers
2. Найди **"Website Push ID: web.com.coupleplanner.push"**
3. Кликни на него → **Create Certificate**
4. Загрузи CSR файл → **Continue**
5. **Скачай сертификат** (website_push.cer)

---

## 🔄 Шаг 3: Конвертируй в .p12 для OneSignal

### На Mac:

1. **Двойной клик** на `website_push.cer` - добавится в Keychain Access
2. Открой **Keychain Access** → найди сертификат "Website Push ID: web.com.coupleplanner.push"
3. **Разверни сертификат** (стрелка слева) - увидишь приватный ключ
4. **Выдели оба** (сертификат + ключ)
5. **Правый клик** → **Export 2 items**
6. Сохрани как: `CouplePlannerPush.p12`
7. **Установи пароль** (например: `push123`) - запомни его!

### На Windows:

```bash
# Конвертируй .cer в .pem
openssl x509 -in website_push.cer -inform DER -out push_cert.pem -outform PEM

# Создай .p12
openssl pkcs12 -export -out CouplePlannerPush.p12 -inkey push.key -in push_cert.pem
```

---

## 🔔 Шаг 4: Настрой OneSignal

1. Открой: https://dashboard.onesignal.com/apps/cb22405e-14fd-45fb-82b3-f68180e0fbe6/settings/platforms

2. Найди **"Apple Safari (macOS & iOS)"**

3. Нажми **"Configure"**

4. Загрузи:
   - **Safari Web Push Certificate:** `CouplePlannerPush.p12`
   - **Certificate Password:** пароль, который установил (например: `push123`)
   - **Website Push ID:** `web.com.coupleplanner.push`
   - **Website URL:** `https://couple-planner-ten.vercel.app`

5. Нажми **Save**

---

## 🚀 Шаг 5: Задеплой обновленный код

Код уже обновлен с `safari_web_id`. Теперь задеплой:

```bash
git add .
git commit -m "Add Safari Web Push ID for iOS support"
git push
```

Подожди 1-2 минуты, пока Vercel задеплоит изменения.

---

## 🧪 Шаг 6: Протестируй на iPhone

1. Открой **Safari** на iPhone (не Chrome!)
2. Перейди на: https://couple-planner-ten.vercel.app
3. Войди как `olga@example.com` / `password123`
4. Нажми **"Включить уведомления"**
5. Разреши уведомления
6. На другом устройстве создай задачу для Ольги
7. **Уведомление должно прийти на iPhone!** 🎉

---

## ❓ Частые вопросы

**Q: Нужно ли платить за Apple Developer?**  
A: Да, $99/год. Но у тебя уже есть аккаунт!

**Q: Работает ли на старых версиях iOS?**  
A: Safari Web Push работает на iOS 16.4+

**Q: Что если не получается создать .p12?**  
A: Напиши мне, помогу с конвертацией сертификата

**Q: Нужно ли обновлять сертификат?**  
A: Да, сертификаты действуют 1 год, потом нужно обновить

---

## 📋 Чеклист

- [ ] Создал Website Push ID на developer.apple.com
- [ ] Создал CSR (Certificate Signing Request)
- [ ] Скачал сертификат (.cer)
- [ ] Конвертировал в .p12
- [ ] Загрузил в OneSignal
- [ ] Задеплоил код с safari_web_id
- [ ] Протестировал на iPhone

---

## 🎯 Результат

После выполнения всех шагов:

✅ Push-уведомления работают на iOS (Safari)  
✅ Push-уведомления работают на Android  
✅ Push-уведомления работают на Desktop  
✅ Полная поддержка всех платформ!

---

## 🆘 Нужна помощь?

Если что-то не получается:
1. Проверь, что Website Push ID правильно указан в OneSignal
2. Проверь, что сертификат не истек
3. Проверь логи в консоли браузера (F12)
4. Напиши мне - помогу разобраться!
