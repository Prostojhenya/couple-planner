# Документ проектирования: Визуальная Mind-Map система управления задачами

## Обзор

Визуальная mind-map система представляет собой интерактивное canvas-приложение для управления задачами с радиальной раскладкой. Система построена на трёх уровнях визуальной иерархии (HUB → Cluster → Task) и поддерживает совместную работу с гибкой системой ролей и прав доступа.

### Ключевые особенности

- **Трёхуровневая иерархия**: HUB (контекст) → Cluster (группа задач) → Task (отдельная задача)
- **Интуитивные жесты**: Long-press + drag для создания, tap для раскрытия/сворачивания
- **Совместная работа**: Система ролей (Admin/User/Viewer) и детальные права на уровне кластера
- **Реал-тайм синхронизация**: Мгновенное отображение изменений для всех участников
- **Canvas-based рендеринг**: Плавные анимации и визуальные связи между элементами

## Архитектура

### Общая структура

```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Canvas     │  │  Gesture     │  │   Modal      │  │
│  │   Renderer   │  │  Handler     │  │   Panels     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│                    State Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Canvas     │  │  Realtime    │  │   Auth       │  │
│  │   State      │  │  Sync        │  │   Context    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│                    API Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Cluster    │  │   Task       │  │   Member     │  │
│  │   API        │  │   API        │  │   API        │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│                    Data Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Prisma     │  │  WebSocket   │  │   Redis      │  │
│  │   ORM        │  │  Server      │  │   Cache      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Технологический стек

**Frontend:**
- React 18+ с TypeScript
- Canvas API для рендеринга элементов и связей
- Framer Motion для анимаций
- Zustand для управления состоянием
- Socket.io-client для реал-тайм обновлений

**Backend:**
- Next.js API Routes
- Prisma ORM для работы с базой данных
- Socket.io для WebSocket соединений
- Redis для кэширования и pub/sub

**База данных:**
- PostgreSQL (существующая база с Prisma)

## Компоненты и интерфейсы

### 1. Canvas Renderer

Отвечает за отрисовку всех визуальных элементов на canvas.

```typescript
interface CanvasRenderer {
  // Инициализация canvas
  initialize(canvasElement: HTMLCanvasElement): void;
  
  // Отрисовка всех элементов
  render(state: CanvasState): void;
  
  // Отрисовка отдельных элементов
  renderHub(hub: Hub): void;
  renderCluster(cluster: Cluster): void;
  renderTask(task: Task): void;
  renderConnection(from: Position, to: Position): void;
  
  // Управление анимациями
  animateExpand(cluster: Cluster, tasks: Task[]): Promise<void>;
  animateCollapse(cluster: Cluster): Promise<void>;
  
  // Утилиты
  clear(): void;
  resize(): void;
}

interface Position {
  x: number;
  y: number;
}

interface CanvasState {
  hub: Hub;
  clusters: Cluster[];
  tasks: Task[];
  selectedElement: string | null;
  expandedClusters: Set<string>;
}
```

### 2. Gesture Handler

Обрабатывает все touch-жесты пользователя.

```typescript
interface GestureHandler {
  // Регистрация обработчиков
  onTap(callback: (position: Position) => void): void;
  onLongPress(callback: (position: Position) => void): void;
  onDrag(callback: (start: Position, current: Position) => void): void;
  onDragEnd(callback: (start: Position, end: Position) => void): void;
  
  // Определение элемента под курсором
  getElementAt(position: Position): Element | null;
  
  // Управление состоянием жестов
  startGesture(type: GestureType): void;
  endGesture(): void;
}

type GestureType = 'tap' | 'long-press' | 'drag';

interface Element {
  id: string;
  type: 'hub' | 'cluster' | 'task';
  bounds: Bounds;
}

interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

### 3. Bubble Components

Базовые визуальные элементы системы.

```typescript
// Базовый интерфейс для всех пузырей
interface Bubble {
  id: string;
  position: Position;
  size: number;
  type: BubbleType;
}

type BubbleType = 'hub' | 'cluster' | 'task';

// HUB - центральный элемент
interface Hub extends Bubble {
  type: 'hub';
  size: 128; // фиксированный размер
  context: Context;
  clusterCount: number;
}

interface Context {
  type: 'personal' | 'shared' | 'group';
  participants: string[]; // инициалы
}

// Cluster - группа задач
interface Cluster extends Bubble {
  type: 'cluster';
  size: 96; // фиксированный размер
  clusterType: ClusterType;
  taskCount: number;
  isExpanded: boolean;
  ownerId: string;
  members: ClusterMember[];
}

type ClusterType = 'task' | 'event' | 'shop' | 'custom';

interface ClusterMember {
  userId: string;
  role: Role;
  permissions: Permission[];
}

type Role = 'admin' | 'user' | 'viewer';

type Permission = 
  | 'add_tasks'
  | 'complete_tasks'
  | 'delete_tasks'
  | 'invite_members'
  | 'manage_permissions';

// Task - отдельная задача
interface Task extends Bubble {
  type: 'task';
  size: 32; // фиксированный размер
  clusterId: string;
  parentTaskId: string | null; // для вложенности
  title: string;
  completed: boolean;
  icon: string;
}
```

### 4. State Management

Управление состоянием приложения с использованием Zustand.

```typescript
interface CanvasStore {
  // Состояние
  hub: Hub;
  clusters: Map<string, Cluster>;
  tasks: Map<string, Task>;
  expandedClusters: Set<string>;
  selectedElement: string | null;
  
  // Действия - HUB
  initializeHub(context: Context): void;
  
  // Действия - Cluster
  createCluster(position: Position, type: ClusterType): string;
  deleteCluster(clusterId: string): void;
  moveCluster(clusterId: string, position: Position): void;
  toggleCluster(clusterId: string): void;
  
  // Действия - Task
  createTask(clusterId: string, title: string): string;
  createSubTask(parentTaskId: string, title: string): string;
  deleteTask(taskId: string): void;
  toggleTaskComplete(taskId: string): void;
  
  // Действия - Members
  addMember(clusterId: string, userId: string, role: Role): void;
  removeMember(clusterId: string, userId: string): void;
  updateMemberRole(clusterId: string, userId: string, role: Role): void;
  updateMemberPermissions(
    clusterId: string, 
    userId: string, 
    permissions: Permission[]
  ): void;
  
  // Утилиты
  getClusterTasks(clusterId: string): Task[];
  getTaskChildren(taskId: string): Task[];
  hasPermission(clusterId: string, userId: string, permission: Permission): boolean;
}
```

### 5. API Endpoints

REST API для взаимодействия с сервером.

```typescript
// Cluster API
interface ClusterAPI {
  // CRUD операции
  POST   /api/clusters              → createCluster(data: CreateClusterDto): Cluster
  GET    /api/clusters/:id          → getCluster(id: string): Cluster
  PATCH  /api/clusters/:id          → updateCluster(id: string, data: UpdateClusterDto): Cluster
  DELETE /api/clusters/:id          → deleteCluster(id: string): void
  
  // Управление участниками
  POST   /api/clusters/:id/members  → addMember(clusterId: string, data: AddMemberDto): ClusterMember
  DELETE /api/clusters/:id/members/:userId → removeMember(clusterId: string, userId: string): void
  PATCH  /api/clusters/:id/members/:userId → updateMember(clusterId: string, userId: string, data: UpdateMemberDto): ClusterMember
  
  // Приглашения
  POST   /api/clusters/:id/invite   → generateInviteLink(clusterId: string, expiresIn?: number): InviteLink
  POST   /api/clusters/join/:token  → joinCluster(token: string): Cluster
}

// Task API
interface TaskAPI {
  // CRUD операции
  POST   /api/tasks                 → createTask(data: CreateTaskDto): Task
  GET    /api/tasks/:id             → getTask(id: string): Task
  PATCH  /api/tasks/:id             → updateTask(id: string, data: UpdateTaskDto): Task
  DELETE /api/tasks/:id             → deleteTask(id: string): void
  
  // Операции с задачами
  POST   /api/tasks/:id/subtasks    → createSubTask(parentId: string, data: CreateTaskDto): Task
  PATCH  /api/tasks/:id/complete    → toggleComplete(id: string): Task
  GET    /api/clusters/:id/tasks    → getClusterTasks(clusterId: string): Task[]
}

// DTO типы
interface CreateClusterDto {
  position: Position;
  type: ClusterType;
}

interface UpdateClusterDto {
  position?: Position;
  type?: ClusterType;
}

interface CreateTaskDto {
  clusterId: string;
  title: string;
  parentTaskId?: string;
}

interface UpdateTaskDto {
  title?: string;
  completed?: boolean;
  position?: Position;
}

interface AddMemberDto {
  userId: string;
  role: Role;
  permissions?: Permission[];
}

interface UpdateMemberDto {
  role?: Role;
  permissions?: Permission[];
}

interface InviteLink {
  token: string;
  clusterId: string;
  expiresAt: Date;
  url: string;
}
```

### 6. Realtime Sync

WebSocket события для синхронизации в реальном времени.

```typescript
interface RealtimeEvents {
  // События кластера
  'cluster:created': (cluster: Cluster) => void;
  'cluster:updated': (cluster: Cluster) => void;
  'cluster:deleted': (clusterId: string) => void;
  'cluster:moved': (clusterId: string, position: Position) => void;
  'cluster:toggled': (clusterId: string, isExpanded: boolean) => void;
  
  // События задач
  'task:created': (task: Task) => void;
  'task:updated': (task: Task) => void;
  'task:deleted': (taskId: string) => void;
  'task:completed': (taskId: string, completed: boolean) => void;
  
  // События участников
  'member:added': (clusterId: string, member: ClusterMember) => void;
  'member:removed': (clusterId: string, userId: string) => void;
  'member:updated': (clusterId: string, member: ClusterMember) => void;
  
  // Системные события
  'sync:request': () => void;
  'sync:response': (state: CanvasState) => void;
  'connection:lost': () => void;
  'connection:restored': () => void;
}

interface RealtimeClient {
  // Подключение
  connect(userId: string): Promise<void>;
  disconnect(): void;
  
  // Подписка на события
  on<K extends keyof RealtimeEvents>(
    event: K,
    handler: RealtimeEvents[K]
  ): void;
  
  // Отправка событий
  emit<K extends keyof RealtimeEvents>(
    event: K,
    ...args: Parameters<RealtimeEvents[K]>
  ): void;
  
  // Управление комнатами
  joinCluster(clusterId: string): void;
  leaveCluster(clusterId: string): void;
}
```

### 7. Modal Panels

Модальные панели для управления участниками и настройками.

```typescript
interface MemberManagementPanel {
  clusterId: string;
  isOpen: boolean;
  
  // Отображение
  render(): ReactElement;
  open(): void;
  close(): void;
  
  // Данные
  members: ClusterMember[];
  currentUserRole: Role;
  
  // Действия
  onAddMember(userId: string, role: Role): void;
  onRemoveMember(userId: string): void;
  onUpdateRole(userId: string, role: Role): void;
  onUpdatePermissions(userId: string, permissions: Permission[]): void;
  onGenerateInvite(expiresIn?: number): void;
}

interface PermissionEditor {
  userId: string;
  currentPermissions: Permission[];
  availablePermissions: Permission[];
  
  // Отображение
  render(): ReactElement;
  
  // Действия
  onTogglePermission(permission: Permission): void;
  onSave(permissions: Permission[]): void;
  onCancel(): void;
}
```

## Модели данных

### Prisma Schema

```prisma
// Расширение существующей схемы

model Hub {
  id            String    @id @default(cuid())
  userId        String
  contextType   String    // 'personal' | 'shared' | 'group'
  participants  String[]  // массив инициалов
  clusters      Cluster[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
}

model Cluster {
  id            String          @id @default(cuid())
  hubId         String
  ownerId       String
  type          String          // 'task' | 'event' | 'shop' | 'custom'
  positionX     Float
  positionY     Float
  isExpanded    Boolean         @default(false)
  tasks         Task[]
  members       ClusterMember[]
  inviteLinks   InviteLink[]
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  
  hub           Hub             @relation(fields: [hubId], references: [id], onDelete: Cascade)
  owner         User            @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  
  @@index([hubId])
  @@index([ownerId])
}

model Task {
  id            String    @id @default(cuid())
  clusterId     String
  parentTaskId  String?   // для вложенности
  title         String
  completed     Boolean   @default(false)
  icon          String    @default("check")
  positionX     Float?    // позиция при раскрытии кластера
  positionY     Float?
  order         Int       @default(0)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  cluster       Cluster   @relation(fields: [clusterId], references: [id], onDelete: Cascade)
  parent        Task?     @relation("TaskChildren", fields: [parentTaskId], references: [id], onDelete: Cascade)
  children      Task[]    @relation("TaskChildren")
  
  @@index([clusterId])
  @@index([parentTaskId])
}

model ClusterMember {
  id            String       @id @default(cuid())
  clusterId     String
  userId        String
  role          String       // 'admin' | 'user' | 'viewer'
  permissions   String[]     // массив разрешений
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  
  cluster       Cluster      @relation(fields: [clusterId], references: [id], onDelete: Cascade)
  user          User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([clusterId, userId])
  @@index([clusterId])
  @@index([userId])
}

model InviteLink {
  id            String    @id @default(cuid())
  clusterId     String
  token         String    @unique
  expiresAt     DateTime
  createdById   String
  usedBy        String?
  usedAt        DateTime?
  createdAt     DateTime  @default(now())
  
  cluster       Cluster   @relation(fields: [clusterId], references: [id], onDelete: Cascade)
  createdBy     User      @relation("InviteCreator", fields: [createdById], references: [id])
  user          User?     @relation("InviteUser", fields: [usedBy], references: [id])
  
  @@index([clusterId])
  @@index([token])
}

// Расширение существующей модели User
model User {
  // ... существующие поля
  
  hubs              Hub[]
  ownedClusters     Cluster[]
  clusterMemberships ClusterMember[]
  createdInvites    InviteLink[]      @relation("InviteCreator")
  usedInvites       InviteLink[]      @relation("InviteUser")
}
```

### Структура данных в Redis

```typescript
// Кэш для быстрого доступа к данным кластера
interface ClusterCache {
  key: `cluster:${clusterId}`;
  value: {
    cluster: Cluster;
    members: ClusterMember[];
    taskCount: number;
    lastUpdated: number;
  };
  ttl: 3600; // 1 час
}

// Pub/Sub каналы для реал-тайм обновлений
interface PubSubChannels {
  [`cluster:${clusterId}:updates`]: ClusterUpdate;
  [`user:${userId}:notifications`]: Notification;
}

interface ClusterUpdate {
  type: 'cluster' | 'task' | 'member';
  action: 'created' | 'updated' | 'deleted';
  data: any;
  timestamp: number;
}
```

## Correctness Properties

*Свойство корректности (property) — это характеристика или поведение, которое должно выполняться во всех допустимых сценариях работы системы. По сути, это формальное утверждение о том, что система должна делать. Свойства служат мостом между человекочитаемыми спецификациями и машинопроверяемыми гарантиями корректности.*


### Property Reflection

После анализа всех acceptance criteria выявлены следующие избыточности:

**Избыточные свойства (будут объединены или удалены):**
- 3.5 дублирует 1.3 (отображение Task)
- 5.2 дублирует 3.3 (увеличение счётчика при добавлении)
- 5.4 дублирует 4.2 (скрытие счётчика при раскрытии)
- 5.5 дублирует 4.4 (отображение счётчика при сворачивании)
- 16.1 дублирует 3.2 (создание вложенной задачи)
- 17.2 дублирует 2.5 (выбор типа кластера)

**Свойства, которые можно объединить:**
- 14.2 и 14.3 → одно свойство о персистентности всех данных
- 18.4 и 18.5 → одно round-trip свойство о сохранении и восстановлении позиций

**Итоговое количество уникальных properties:** ~45 свойств после устранения дубликатов

### Correctness Properties

#### Property 1: Размеры пузырей соответствуют спецификации
*For any* элемент системы (HUB, Cluster или Task), его размер должен соответствовать спецификации: Task = 32px, Cluster = 96px, HUB = 128px
**Validates: Requirements 1.1**

#### Property 2: Task отображается без текста и счётчика
*For any* Task, его визуальное представление должно содержать только иконку типа, без текста описания и без счётчика
**Validates: Requirements 1.3**

#### Property 3: Cluster содержит все обязательные элементы
*For any* Cluster, его визуальное представление должно содержать иконку типа, счётчик задач и метку участников
**Validates: Requirements 1.4**

#### Property 4: HUB содержит инициалы и счётчик
*For any* HUB, его визуальное представление должно содержать инициалы контекста и счётчик кластеров
**Validates: Requirements 1.5**

#### Property 5: Long-press активирует режим создания
*For any* HUB, выполнение long-press жеста (1-2 секунды) должно активировать режим создания кластера
**Validates: Requirements 2.1**

#### Property 6: Создание кластера в указанной позиции
*For any* валидная позиция на canvas, завершение жеста drag от HUB должно создать новый Cluster в этой позиции
**Validates: Requirements 2.3**

#### Property 7: Связь между HUB и Cluster
*For any* созданный Cluster, должна существовать визуальная связь от HUB к этому кластеру
**Validates: Requirements 2.4**

#### Property 8: Выбор типа после создания кластера
*For any* новый Cluster, после создания система должна предложить выбрать тип из списка (Task/Event/Shop/Custom)
**Validates: Requirements 2.5**

#### Property 9: Создание задачи из раскрытого кластера
*For any* раскрытый Cluster, нажатие на кнопку "+" должно создать новый Task в этом кластере
**Validates: Requirements 3.1**

#### Property 10: Создание вложенной задачи
*For any* Task, создание задачи из него должно установить parent-child связь, где исходная задача является родителем
**Validates: Requirements 3.2**

#### Property 11: Счётчик увеличивается при добавлении задачи
*For any* Cluster, создание Task в нём должно увеличить счётчик задач на 1
**Validates: Requirements 3.3**

#### Property 12: Задача принадлежит кластеру
*For any* созданный Task, он должен быть автоматически связан с соответствующим Cluster через clusterId
**Validates: Requirements 3.4**

#### Property 13: Раскрытие кластера изменяет состояние
*For any* свёрнутый Cluster, нажатие на него должно изменить его состояние на isExpanded = true
**Validates: Requirements 4.1**

#### Property 14: Раскрытый кластер показывает задачи
*For any* раскрытый Cluster, его визуальное представление должно скрывать счётчик и отображать все Task как отдельные пузыри в кольце
**Validates: Requirements 4.2**

#### Property 15: Toggle кластера - идемпотентность
*For any* Cluster, двойное переключение (раскрыть → свернуть) должно вернуть кластер в исходное состояние
**Validates: Requirements 4.3**

#### Property 16: Свёрнутый кластер показывает счётчик
*For any* свёрнутый Cluster, его визуальное представление должно скрывать отдельные Task и отображать счётчик
**Validates: Requirements 4.4**

#### Property 17: Счётчик отражает количество задач
*For any* Cluster, его счётчик должен быть равен количеству Task, связанных с этим кластером
**Validates: Requirements 5.1**

#### Property 18: Счётчик уменьшается при удалении задачи
*For any* Cluster с задачами, удаление Task из него должно уменьшить счётчик на 1
**Validates: Requirements 5.3**

#### Property 19: Long-press открывает панель управления
*For any* Cluster, выполнение long-press на метке участников должно открыть Modal_Panel управления участниками
**Validates: Requirements 6.1**

#### Property 20: Панель отображает участников с ролями
*For any* открытая Modal_Panel управления участниками, она должна содержать список всех участников кластера с их ролями
**Validates: Requirements 6.2**

#### Property 21: Изменение прав применяется
*For any* Admin кластера, изменение Permission участника должно немедленно обновить права этого участника в системе
**Validates: Requirements 6.4**

#### Property 22: Создатель кластера - Admin
*For any* новый Cluster, его создатель должен автоматически получить роль Admin
**Validates: Requirements 7.1**

#### Property 23: Admin имеет все права
*For any* пользователь с ролью Admin в кластере, он должен иметь все доступные права: создание, удаление, приглашение, изменение прав, просмотр
**Validates: Requirements 7.3**

#### Property 24: User выполняет только разрешённые действия
*For any* пользователь с ролью User, он может выполнять только действия, для которых у него есть соответствующие Permission
**Validates: Requirements 7.4**

#### Property 25: Viewer только просматривает
*For any* пользователь с ролью Viewer, он не может выполнять никакие действия изменения данных (только чтение)
**Validates: Requirements 7.5**

#### Property 26: Права изолированы по кластерам
*For any* два разных Cluster, изменение Permission в одном не должно влиять на права в другом
**Validates: Requirements 8.1**

#### Property 27: Проверка прав перед действием
*For any* действие пользователя, система должна проверить наличие соответствующего Permission перед выполнением
**Validates: Requirements 8.3**

#### Property 28: Отказ при отсутствии прав
*For any* действие без необходимого Permission, система должна запретить его выполнение и вернуть ошибку
**Validates: Requirements 8.4**

#### Property 29: Немедленное применение изменений прав
*For any* изменение Permission администратором, новые права должны применяться немедленно без необходимости перезагрузки
**Validates: Requirements 8.5**

#### Property 30: Переключение навигации изменяет view
*For any* раздел навигации (Map/Tasks/Inbox/Calendar), нажатие на него должно переключить активное представление
**Validates: Requirements 10.4**

#### Property 31: Состояние Canvas сохраняется
*For any* состояние Canvas, переключение между разделами навигации и возврат обратно должно восстановить исходное состояние
**Validates: Requirements 10.5**

#### Property 32: Длительность анимаций ≤ 300ms
*For any* анимация в системе, её длительность не должна превышать 300ms для обеспечения отзывчивости
**Validates: Requirements 12.5**

#### Property 33: Синхронизация изменений кластера
*For any* изменение Cluster одним участником, все остальные участники должны увидеть это изменение в реальном времени
**Validates: Requirements 13.1**

#### Property 34: Синхронизация счётчика задач
*For any* добавление или удаление Task одним участником, счётчик Cluster должен обновиться для всех участников
**Validates: Requirements 13.2**

#### Property 35: Синхронизация прав доступа
*For any* изменение Permission одним администратором, затронутые участники должны немедленно получить обновлённые права
**Validates: Requirements 13.3**

#### Property 36: Восстановление соединения
*For any* потеря WebSocket соединения, система должна автоматически попытаться восстановить соединение
**Validates: Requirements 13.5**

#### Property 37: Персистентность данных
*For any* элемент системы (HUB, Cluster, Task, Member), его данные должны сохраняться в базе данных
**Validates: Requirements 14.2, 14.3**

#### Property 38: Round-trip сохранения действий
*For any* действие пользователя, сохранение в базу данных и последующее чтение должно вернуть эквивалентные данные
**Validates: Requirements 14.4**

#### Property 39: API возвращает корректные статусы
*For any* API запрос, ответ должен содержать соответствующий HTTP статус код (200/201 для успеха, 4xx для ошибок клиента, 5xx для ошибок сервера)
**Validates: Requirements 15.4**

#### Property 40: API валидирует входные данные
*For any* API запрос с невалидными данными, система должна вернуть ошибку валидации (400) и не выполнять операцию
**Validates: Requirements 15.5**

#### Property 41: Неограниченная глубина вложенности
*For any* Task, должна быть возможность создать дочернюю задачу независимо от текущей глубины вложенности
**Validates: Requirements 16.2**

#### Property 42: Обработка удаления родительской задачи
*For any* Task с дочерними задачами, его удаление должно предложить пользователю удалить или переместить дочерние задачи
**Validates: Requirements 16.3**

#### Property 43: Счёт всех вложенных задач
*For any* Cluster, его счётчик должен включать все Task независимо от уровня вложенности
**Validates: Requirements 16.5**

#### Property 44: Иконка соответствует типу кластера
*For any* Cluster, его иконка должна соответствовать выбранному типу (Task/Event/Shop/Custom)
**Validates: Requirements 17.3**

#### Property 45: Обновление иконки при смене типа
*For any* Cluster, изменение его типа должно немедленно обновить отображаемую иконку
**Validates: Requirements 17.4**

#### Property 46: Персистентность типа кластера
*For any* Cluster, его тип должен сохраняться в базе данных и восстанавливаться при загрузке
**Validates: Requirements 17.5**

#### Property 47: HUB всегда в центре
*For any* состояние Canvas, HUB должен находиться в центре координат
**Validates: Requirements 18.1**

#### Property 48: Кластер создаётся в указанной позиции
*For any* позиция на canvas, созданный в ней Cluster должен иметь координаты, соответствующие этой позиции
**Validates: Requirements 18.2**

#### Property 49: Связь обновляется при перемещении
*For any* Cluster, изменение его позиции должно обновить визуальную связь между HUB и кластером
**Validates: Requirements 18.3**

#### Property 50: Round-trip позиций элементов
*For any* набор элементов с позициями, сохранение в базу данных и последующая загрузка должны восстановить те же позиции
**Validates: Requirements 18.4, 18.5**

#### Property 51: Task не содержит Bubble
*For any* Task, он не должен содержать внутри себя другие Bubble (только может иметь дочерние Task через parent-child связь)
**Validates: Requirements 19.1**

#### Property 52: Cluster содержит только Task
*For any* Cluster, все его дочерние элементы должны быть типа Task (не Cluster и не HUB)
**Validates: Requirements 19.2**

#### Property 53: HUB содержит только Cluster
*For any* HUB, все его дочерние элементы должны быть типа Cluster (не Task напрямую)
**Validates: Requirements 19.3**

#### Property 54: Валидация иерархии
*For any* попытка нарушить иерархию (например, добавить Cluster в Task), система должна запретить операцию
**Validates: Requirements 19.4**

#### Property 55: Уникальность ссылок приглашения
*For any* два запроса на генерацию ссылки приглашения, они должны создать разные уникальные токены
**Validates: Requirements 20.1**

#### Property 56: Структура ссылки приглашения
*For any* сгенерированная ссылка приглашения, она должна содержать clusterId и уникальный токен безопасности
**Validates: Requirements 20.2**

#### Property 57: Присоединение по ссылке
*For any* валидная ссылка приглашения, переход по ней должен добавить пользователя в Cluster с ролью User
**Validates: Requirements 20.3**

#### Property 58: Истёкшие ссылки не работают
*For any* ссылка приглашения с истёкшим сроком действия, попытка присоединения должна быть отклонена с ошибкой
**Validates: Requirements 20.5**

## Обработка ошибок

### Стратегия обработки ошибок

**Уровни обработки:**

1. **Client-side валидация**
   - Проверка прав доступа перед отправкой запроса
   - Валидация формата данных (позиции, названия, типы)
   - Проверка иерархии элементов

2. **API-level валидация**
   - Проверка аутентификации и авторизации
   - Валидация входных данных (DTO)
   - Проверка существования ресурсов
   - Проверка прав на уровне кластера

3. **Database-level обработка**
   - Обработка constraint violations
   - Транзакционная целостность
   - Обработка конфликтов при одновременных изменениях

### Типы ошибок

```typescript
enum ErrorCode {
  // Аутентификация и авторизация
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  
  // Валидация данных
  INVALID_INPUT = 'INVALID_INPUT',
  INVALID_POSITION = 'INVALID_POSITION',
  INVALID_HIERARCHY = 'INVALID_HIERARCHY',
  
  // Ресурсы
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  CLUSTER_NOT_FOUND = 'CLUSTER_NOT_FOUND',
  TASK_NOT_FOUND = 'TASK_NOT_FOUND',
  
  // Бизнес-логика
  CLUSTER_LIMIT_REACHED = 'CLUSTER_LIMIT_REACHED',
  MEMBER_ALREADY_EXISTS = 'MEMBER_ALREADY_EXISTS',
  CANNOT_REMOVE_OWNER = 'CANNOT_REMOVE_OWNER',
  INVITE_EXPIRED = 'INVITE_EXPIRED',
  
  // Система
  DATABASE_ERROR = 'DATABASE_ERROR',
  WEBSOCKET_ERROR = 'WEBSOCKET_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
}

interface AppError {
  code: ErrorCode;
  message: string;
  details?: Record<string, any>;
  timestamp: number;
}
```

### Обработка специфичных ошибок

**Ошибки прав доступа:**
```typescript
// Проверка перед действием
if (!hasPermission(clusterId, userId, 'add_tasks')) {
  throw new AppError({
    code: ErrorCode.INSUFFICIENT_PERMISSIONS,
    message: 'У вас нет прав на добавление задач в этот кластер',
    details: { clusterId, requiredPermission: 'add_tasks' }
  });
}
```

**Ошибки иерархии:**
```typescript
// Проверка при создании элемента
if (parentType === 'task' && childType === 'cluster') {
  throw new AppError({
    code: ErrorCode.INVALID_HIERARCHY,
    message: 'Нельзя добавить кластер внутрь задачи',
    details: { parentType, childType }
  });
}
```

**Ошибки WebSocket:**
```typescript
// Обработка потери соединения
socket.on('disconnect', () => {
  showNotification('Соединение потеряно. Попытка восстановления...');
  attemptReconnect();
});

socket.on('reconnect', () => {
  showNotification('Соединение восстановлено');
  syncState(); // Синхронизация состояния
});
```

## Стратегия тестирования

### Dual Testing Approach

Система использует комбинацию unit-тестов и property-based тестов для обеспечения комплексного покрытия:

**Unit Tests:**
- Конкретные примеры и edge cases
- Интеграционные точки между компонентами
- Специфичные сценарии ошибок
- Примеры использования API endpoints

**Property-Based Tests:**
- Универсальные свойства, которые должны выполняться для всех входных данных
- Проверка инвариантов системы
- Валидация бизнес-правил на большом количестве случайных данных
- Каждое свойство из раздела Correctness Properties

### Property-Based Testing Configuration

**Библиотека:** fast-check (для TypeScript/JavaScript)

**Конфигурация:**
- Минимум 100 итераций на каждый property test
- Каждый тест должен быть помечен комментарием с ссылкой на свойство из design.md
- Формат тега: `// Feature: visual-mind-map-task-system, Property N: [описание свойства]`

**Пример property test:**
```typescript
import fc from 'fast-check';

// Feature: visual-mind-map-task-system, Property 11: Счётчик увеличивается при добавлении задачи
describe('Cluster task counter', () => {
  it('should increment by 1 when task is added', () => {
    fc.assert(
      fc.property(
        fc.record({
          clusterId: fc.uuid(),
          taskTitle: fc.string({ minLength: 1, maxLength: 100 }),
        }),
        async ({ clusterId, taskTitle }) => {
          // Arrange
          const cluster = await createCluster({ type: 'task' });
          const initialCount = cluster.taskCount;
          
          // Act
          await createTask({ clusterId: cluster.id, title: taskTitle });
          const updatedCluster = await getCluster(cluster.id);
          
          // Assert
          expect(updatedCluster.taskCount).toBe(initialCount + 1);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Test Coverage Areas

**1. Визуальные элементы (Properties 1-4)**
- Unit tests: Проверка рендеринга конкретных элементов
- Property tests: Проверка размеров и содержимого для случайных элементов

**2. Создание и управление элементами (Properties 5-18)**
- Unit tests: Конкретные сценарии создания (первый кластер, вложенная задача)
- Property tests: Создание случайных элементов, проверка инвариантов

**3. Система ролей и прав (Properties 21-29)**
- Unit tests: Конкретные комбинации ролей и прав
- Property tests: Случайные комбинации пользователей, ролей и действий

**4. Реал-тайм синхронизация (Properties 33-36)**
- Unit tests: Конкретные сценарии синхронизации (2 пользователя)
- Property tests: Случайное количество пользователей и действий

**5. Персистентность (Properties 37-38, 46, 50)**
- Unit tests: Сохранение конкретных объектов
- Property tests: Round-trip тесты для случайных данных

**6. API (Properties 39-40)**
- Unit tests: Конкретные endpoints и статус-коды
- Property tests: Случайные валидные и невалидные данные

**7. Иерархия (Properties 51-54)**
- Unit tests: Конкретные попытки нарушения иерархии
- Property tests: Случайные комбинации элементов и операций

**8. Приглашения (Properties 55-58)**
- Unit tests: Конкретные сценарии приглашений
- Property tests: Генерация множества ссылок, проверка уникальности

### Integration Testing

**Сценарии интеграционного тестирования:**

1. **Полный цикл работы с кластером:**
   - Создание HUB
   - Создание кластера
   - Добавление задач
   - Раскрытие/сворачивание
   - Удаление

2. **Совместная работа:**
   - Создание кластера пользователем A
   - Приглашение пользователя B
   - Одновременные изменения
   - Синхронизация состояния

3. **Обработка ошибок:**
   - Попытки действий без прав
   - Нарушение иерархии
   - Потеря соединения и восстановление

### E2E Testing

**Инструменты:** Playwright или Cypress

**Критические пользовательские сценарии:**

1. Создание первого кластера через long-press + drag
2. Добавление задач в кластер
3. Раскрытие кластера и просмотр задач
4. Приглашение участника и совместная работа
5. Управление правами участников
6. Навигация между разделами с сохранением состояния

### Performance Testing

**Метрики:**
- Время рендеринга canvas с 50+ элементами < 16ms (60 FPS)
- Время отклика API < 200ms
- Задержка WebSocket синхронизации < 100ms
- Длительность анимаций ≤ 300ms (Property 32)

**Нагрузочное тестирование:**
- 100+ кластеров на одном canvas
- 1000+ задач в одном кластере
- 10+ одновременных пользователей в одном кластере
