# 📡 Примеры использования API

## Авторизация

### Регистрация нового пользователя

**Запрос:**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "Иван Иванов"
}
```

**Ответ (200):**
```json
{
  "user": {
    "id": "clx123...",
    "email": "user@example.com",
    "name": "Иван Иванов"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Ошибки:**
- 400: Email уже используется
- 400: Неверные данные (пароль < 8 символов)

### Вход в систему

**Запрос:**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Ответ (200):**
```json
{
  "user": {
    "id": "clx123...",
    "email": "user@example.com",
    "name": "Иван Иванов"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Ошибки:**
- 401: Неверный email или пароль

---

## Управление парой

### Создать пространство пары

**Запрос:**
```bash
POST /api/couple/create
Authorization: Bearer {token}
```

**Ответ (200):**
```json
{
  "id": "clx456...",
  "createdAt": "2026-01-20T10:00:00.000Z",
  "members": [
    {
      "id": "clx789...",
      "userId": "clx123...",
      "role": "member",
      "user": {
        "id": "clx123...",
        "email": "user@example.com",
        "name": "Иван Иванов"
      }
    }
  ]
}
```

**Ошибки:**
- 401: Не авторизован
- 400: Вы уже состоите в паре

### Пригласить партнёра

**Запрос:**
```bash
POST /api/couple/invite
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "partner@example.com"
}
```

**Ответ (200):**
```json
{
  "invite": {
    "id": "clx999...",
    "coupleId": "clx456...",
    "token": "a1b2c3d4e5f6...",
    "invitedEmail": "partner@example.com",
    "status": "pending",
    "expiresAt": "2026-01-27T10:00:00.000Z"
  },
  "inviteUrl": "http://localhost:3000/invite/a1b2c3d4e5f6..."
}
```

**Ошибки:**
- 401: Не авторизован
- 400: Сначала создайте пространство пары
- 400: В паре уже 2 участника

### Получить информацию о паре

**Запрос:**
```bash
GET /api/couple/me
Authorization: Bearer {token}
```

**Ответ (200):**
```json
{
  "couple": {
    "id": "clx456...",
    "createdAt": "2026-01-20T10:00:00.000Z",
    "members": [
      {
        "id": "clx789...",
        "user": {
          "id": "clx123...",
          "email": "user@example.com",
          "name": "Иван Иванов"
        }
      },
      {
        "id": "clx790...",
        "user": {
          "id": "clx124...",
          "email": "partner@example.com",
          "name": "Мария Петрова"
        }
      }
    ]
  }
}
```

---

## Задачи

### Получить список задач

**Запрос:**
```bash
GET /api/tasks
Authorization: Bearer {token}
```

**Ответ (200):**
```json
[
  {
    "id": "clx111...",
    "title": "Купить продукты",
    "description": "Молоко, хлеб, яйца",
    "isShared": true,
    "assigneeType": "me",
    "status": "new",
    "priority": "medium",
    "dueAt": "2026-01-21T18:00:00.000Z",
    "requiresApproval": false,
    "approvalStatus": null,
    "createdAt": "2026-01-20T10:00:00.000Z",
    "updatedAt": "2026-01-20T10:00:00.000Z",
    "owner": {
      "id": "clx123...",
      "email": "user@example.com",
      "name": "Иван Иванов"
    }
  }
]
```

### Создать задачу

**Запрос:**
```bash
POST /api/tasks
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Купить продукты",
  "description": "Молоко, хлеб, яйца",
  "isShared": true,
  "assigneeType": "me",
  "status": "new",
  "priority": "high",
  "dueAt": "2026-01-21T18:00:00.000Z",
  "requiresApproval": false
}
```

**Ответ (200):**
```json
{
  "id": "clx111...",
  "title": "Купить продукты",
  "description": "Молоко, хлеб, яйца",
  "isShared": true,
  "assigneeType": "me",
  "status": "new",
  "priority": "high",
  "dueAt": "2026-01-21T18:00:00.000Z",
  "requiresApproval": false,
  "approvalStatus": null,
  "createdAt": "2026-01-20T10:00:00.000Z",
  "updatedAt": "2026-01-20T10:00:00.000Z",
  "owner": {
    "id": "clx123...",
    "email": "user@example.com",
    "name": "Иван Иванов"
  }
}
```

**Поля:**
- `title` (обязательное) - название задачи
- `description` (опционально) - описание
- `isShared` (default: false) - общая задача
- `assigneeType` (default: "me") - me | partner | both
- `status` (default: "new") - new | in_progress | completed | postponed
- `priority` (default: "medium") - low | medium | high
- `dueAt` (опционально) - дедлайн (ISO 8601)
- `requiresApproval` (default: false) - требует подтверждения

### Обновить задачу

**Запрос:**
```bash
PATCH /api/tasks/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "in_progress",
  "priority": "high"
}
```

**Ответ (200):**
```json
{
  "id": "clx111...",
  "title": "Купить продукты",
  "status": "in_progress",
  "priority": "high",
  ...
}
```

### Завершить задачу

**Запрос:**
```bash
POST /api/tasks/{id}/complete
Authorization: Bearer {token}
```

**Ответ (200):**
```json
{
  "id": "clx111...",
  "status": "completed",
  ...
}
```

### Удалить задачу

**Запрос:**
```bash
DELETE /api/tasks/{id}
Authorization: Bearer {token}
```

**Ответ (200):**
```json
{
  "success": true
}
```

---

## События

### Получить список событий

**Запрос:**
```bash
GET /api/events
Authorization: Bearer {token}
```

**Ответ (200):**
```json
[
  {
    "id": "clx222...",
    "title": "Ужин в ресторане",
    "description": "Итальянский ресторан",
    "startAt": "2026-01-22T19:00:00.000Z",
    "endAt": "2026-01-22T21:00:00.000Z",
    "allDay": false,
    "participants": "both",
    "location": "Ресторан на площади",
    "requiresApproval": false,
    "approvalStatus": null,
    "createdAt": "2026-01-20T10:00:00.000Z",
    "updatedAt": "2026-01-20T10:00:00.000Z",
    "createdBy": {
      "id": "clx123...",
      "email": "user@example.com",
      "name": "Иван Иванов"
    }
  }
]
```

### Создать событие

**Запрос:**
```bash
POST /api/events
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Ужин в ресторане",
  "description": "Итальянский ресторан",
  "startAt": "2026-01-22T19:00:00.000Z",
  "endAt": "2026-01-22T21:00:00.000Z",
  "allDay": false,
  "participants": "both",
  "location": "Ресторан на площади",
  "requiresApproval": false
}
```

**Ответ (200):**
```json
{
  "id": "clx222...",
  "title": "Ужин в ресторане",
  "description": "Итальянский ресторан",
  "startAt": "2026-01-22T19:00:00.000Z",
  "endAt": "2026-01-22T21:00:00.000Z",
  "allDay": false,
  "participants": "both",
  "location": "Ресторан на площади",
  "requiresApproval": false,
  "approvalStatus": null,
  "createdAt": "2026-01-20T10:00:00.000Z",
  "updatedAt": "2026-01-20T10:00:00.000Z",
  "createdBy": {
    "id": "clx123...",
    "email": "user@example.com",
    "name": "Иван Иванов"
  }
}
```

**Поля:**
- `title` (обязательное) - название события
- `description` (опционально) - описание
- `startAt` (обязательное) - дата начала (ISO 8601)
- `endAt` (обязательное) - дата конца (ISO 8601)
- `allDay` (default: false) - весь день
- `participants` (default: "both") - me | partner | both
- `location` (опционально) - место
- `requiresApproval` (default: false) - требует подтверждения

---

## Уведомления

### Получить уведомления

**Запрос:**
```bash
GET /api/notifications
Authorization: Bearer {token}
```

**Ответ (200):**
```json
[
  {
    "id": "clx333...",
    "userId": "clx123...",
    "type": "task_assigned",
    "payload": "{\"taskId\":\"clx111...\",\"title\":\"Купить продукты\"}",
    "isRead": false,
    "createdAt": "2026-01-20T10:00:00.000Z"
  }
]
```

---

## Приглашения

### Получить информацию о приглашении

**Запрос:**
```bash
GET /api/invite/{token}
```

**Ответ (200):**
```json
{
  "id": "clx999...",
  "coupleId": "clx456...",
  "token": "a1b2c3d4e5f6...",
  "invitedEmail": "partner@example.com",
  "status": "pending",
  "expiresAt": "2026-01-27T10:00:00.000Z",
  "createdBy": {
    "id": "clx123...",
    "email": "user@example.com",
    "name": "Иван Иванов"
  },
  "couple": {
    "id": "clx456...",
    "members": [...]
  }
}
```

**Ошибки:**
- 404: Приглашение не найдено
- 400: Приглашение уже использовано
- 400: Приглашение истекло

### Принять приглашение

**Запрос:**
```bash
POST /api/invite/{token}
Authorization: Bearer {token}
```

**Ответ (200):**
```json
{
  "success": true
}
```

**Ошибки:**
- 401: Не авторизован
- 400: Приглашение недействительно
- 400: В паре уже 2 участника
- 400: Вы уже состоите в паре

---

## Коды ошибок

- **200** - Успешно
- **400** - Неверные данные
- **401** - Не авторизован
- **404** - Не найдено
- **500** - Ошибка сервера

## Формат дат

Все даты в формате ISO 8601:
```
2026-01-20T10:00:00.000Z
```

## Авторизация

Все защищённые эндпоинты требуют JWT токен в заголовке:
```
Authorization: Bearer {token}
```

Токен получается при регистрации или входе и действителен 7 дней.
