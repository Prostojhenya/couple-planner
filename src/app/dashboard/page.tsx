'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import TaskCard from '@/components/TaskCard';
import EventCard from '@/components/EventCard';
import TaskForm from '@/components/TaskForm';
import EventForm from '@/components/EventForm';
import PushNotificationSetup from '@/components/PushNotificationSetup';

// Отключаем статическую генерацию для этой страницы
export const dynamic = 'force-dynamic';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [activeScreen, setActiveScreen] = useState('home');
  const [taskFilter, setTaskFilter] = useState('all');
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [couple, setCouple] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [showSearch, setShowSearch] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [editingTask, setEditingTask] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    // Check for screen parameter
    const screen = searchParams.get('screen');
    if (screen && ['home', 'events', 'settings'].includes(screen)) {
      setActiveScreen(screen);
    }
    
    loadData();
    loadCouple();
    
    // Автоматическое обновление каждые 5 секунд
    const interval = setInterval(() => {
      loadData();
      loadCouple();
    }, 5000);
    
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    const token = localStorage.getItem('token');
    
    try {
      const [tasksRes, eventsRes] = await Promise.all([
        fetch('/api/tasks', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('/api/events', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData);
      }

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(eventsData);
      }
    } catch (err) {
      console.error('Ошибка загрузки данных', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCouple = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/couple/me', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCouple(data.couple);
      }
    } catch (err) {
      console.error('Ошибка загрузки пары', err);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) loadData();
    } catch (err) {
      console.error('Ошибка завершения задачи', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Удалить задачу?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        setSelectedTask(null);
        loadData();
      }
    } catch (err) {
      console.error('Ошибка удаления задачи', err);
    }
  };

  const handleUpdateTask = async (taskId: string, data: any) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      
      if (res.ok) {
        setEditingTask(null);
        setSelectedTask(null);
        loadData();
        alert('Задача обновлена!');
      } else {
        const error = await res.json();
        alert(`Ошибка: ${error.error}`);
      }
    } catch (err) {
      console.error('Ошибка обновления задачи', err);
      alert('Ошибка обновления задачи');
    }
  };

  const handleCreateTask = async (data: any) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setShowTaskForm(false);
        loadData();
      }
    } catch (err) {
      console.error('Ошибка создания задачи', err);
    }
  };

  const handleCreateEvent = async (data: any) => {
    const token = localStorage.getItem('token');
    console.log('Создание события с данными:', data);
    
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      
      console.log('Ответ сервера:', res.status);
      
      if (res.ok) {
        const result = await res.json();
        console.log('Событие создано:', result);
        setShowEventForm(false);
        loadData();
        alert('Событие успешно создано!');
      } else {
        const error = await res.json();
        console.error('Ошибка от сервера:', error);
        alert(`Ошибка создания события: ${error.error || 'Неизвестная ошибка'}`);
      }
    } catch (err) {
      console.error('Ошибка создания события', err);
      alert('Ошибка создания события. Проверьте подключение к интернету.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = 'token=; path=/; max-age=0';
    router.push('/');
  };

  const handleCreateCouple = async () => {
    const token = localStorage.getItem('token');
    
    // Сначала проверим, что пользователь существует
    const userData = localStorage.getItem('user');
    console.log('User data from localStorage:', userData);
    
    if (!userData) {
      alert('Ошибка: данные пользователя не найдены. Попробуйте выйти и войти снова.');
      return;
    }
    
    try {
      const res = await fetch('/api/couple/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log('Create couple response:', data);

      if (res.ok) {
        alert('Пара успешно создана!');
        loadCouple();
        loadData();
      } else {
        if (data.error === 'Вы уже состоите в паре') {
          alert('Вы уже состоите в паре!');
          loadCouple();
        } else {
          alert(`Ошибка: ${data.error}\n\nПопробуйте выйти и войти снова.`);
        }
      }
    } catch (err) {
      console.error('Ошибка создания пары', err);
      alert('Ошибка создания пары. Попробуйте выйти и войти снова.');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Удалить событие?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        setSelectedEvent(null);
        loadData();
        alert('Событие удалено');
      } else {
        const error = await res.json();
        alert(`Ошибка: ${error.error}`);
      }
    } catch (err) {
      console.error('Ошибка удаления события', err);
      alert('Ошибка удаления события');
    }
  };

  const handleUpdateEvent = async (eventId: string, data: any) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      
      if (res.ok) {
        setEditingEvent(null);
        setSelectedEvent(null);
        loadData();
        alert('Событие обновлено!');
      } else {
        const error = await res.json();
        alert(`Ошибка: ${error.error}`);
      }
    } catch (err) {
      console.error('Ошибка обновления события', err);
      alert('Ошибка обновления события');
    }
  };

  let filteredTasks = tasks.filter((task: any) => {
    if (taskFilter === 'all') return true;
    if (taskFilter === 'my') return task.ownerId === user?.id;
    if (taskFilter === 'partner') return task.ownerId !== user?.id;
    if (taskFilter === 'completed') return task.status === 'completed';
    if (taskFilter === 'active') return task.status !== 'completed';
    if (taskFilter === 'high') return task.priority === 'high';
    if (taskFilter === 'today') {
      if (!task.dueAt) return false;
      const today = new Date().toDateString();
      return new Date(task.dueAt).toDateString() === today;
    }
    return true;
  });

  if (searchQuery) {
    filteredTasks = filteredTasks.filter((task: any) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  if (sortBy === 'priority') {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    filteredTasks.sort((a: any, b: any) => 
      priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder]
    );
  } else if (sortBy === 'date') {
    filteredTasks.sort((a: any, b: any) => {
      if (!a.dueAt) return 1;
      if (!b.dueAt) return -1;
      return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
    });
  } else if (sortBy === 'status') {
    filteredTasks.sort((a: any, b: any) => a.status.localeCompare(b.status));
  }

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t: any) => t.status === 'completed').length,
    active: tasks.filter((t: any) => t.status !== 'completed').length,
    myTasks: tasks.filter((t: any) => t.ownerId === user?.id).length,
    highPriority: tasks.filter((t: any) => t.priority === 'high' && t.status !== 'completed').length,
    today: tasks.filter((t: any) => {
      if (!t.dueAt) return false;
      const today = new Date().toDateString();
      return new Date(t.dueAt).toDateString() === today;
    }).length,
  };

  const progress = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  // Показываем экран загрузки пока проверяется токен
  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500 flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl mb-6 animate-bounce">💑</div>
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
          <p className="text-white font-semibold mt-6 text-lg">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-16 text-gray-900 overflow-x-hidden" style={{ margin: 0, padding: 0, paddingBottom: '4rem', minHeight: '100vh', maxWidth: '100vw' }}>
      {/* Mobile Header */}
      <div className="header-fullscreen bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500 text-white px-6 pb-8 rounded-b-[2.5rem] shadow-2xl relative overflow-hidden" style={{ paddingTop: 'calc(3rem + env(safe-area-inset-top))' }}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl border-2 border-white/40 shadow-lg">
                💑
              </div>
              <div>
                <div className="text-sm opacity-90 font-medium">Привет!</div>
                <div className="font-bold text-xl">{user?.name || user?.email?.split('@')[0]}</div>
              </div>
            </div>
            <div className="flex gap-2 items-center relative">
              {loading && (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              )}
              {/* Search - expands to the left without moving icon */}
              <div className="relative">
                {showSearch && (
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Поиск задач..."
                    className="absolute right-14 top-0 w-48 h-11 px-3 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 animate-slideIn"
                    autoFocus
                  />
                )}
                <button
                  onClick={() => {
                    if (showSearch) {
                      setSearchQuery('');
                      setShowSearch(false);
                    } else {
                      setShowSearch(true);
                    }
                  }}
                  className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center hover:bg-white/30 transition border border-white/30"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showSearch ? "M6 18L18 6M6 6l12 12" : "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"} />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Планер для двоих</h1>
          <p className="text-sm text-white/90 mb-6">
            {couple?.members?.length === 2 ? 
              `Вы и ${couple.members.find((m: any) => m.user.id !== user?.id)?.user.name || 'партнёр'}` : 
              'Пригласите партнёра'}
          </p>

          {/* Progress Bar */}
          {activeScreen === 'home' && stats.total > 0 && (
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Прогресс</span>
                <span className="font-bold">{progress}%</span>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-500 shadow-lg"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          {activeScreen === 'home' && (
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3 border border-white/30">
                <div className="text-2xl font-bold">{stats.active}</div>
                <div className="text-xs opacity-90 mt-1">Активных</div>
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3 border border-white/30">
                <div className="text-2xl font-bold">{stats.completed}</div>
                <div className="text-xs opacity-90 mt-1">Готово</div>
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3 border border-white/30">
                <div className="text-2xl font-bold">{stats.today}</div>
                <div className="text-xs opacity-90 mt-1">Сегодня</div>
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3 border border-white/30">
                <div className="text-2xl font-bold">{stats.highPriority}</div>
                <div className="text-xs opacity-90 mt-1">Срочно</div>
              </div>
            </div>
          )}
        </div>
      </div>



      {/* Quick Add Button */}
      <div className="px-4 -mt-6 mb-6 relative z-10">
        <div className="flex gap-2">
          <button
            onClick={() => activeScreen === 'home' ? setShowTaskForm(true) : setShowEventForm(true)}
            className="flex-1 bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-4 rounded-2xl font-bold text-lg shadow-2xl active:scale-[0.98] transition-transform flex items-center justify-center gap-2 hover:shadow-3xl"
          >
            <span className="text-2xl">+</span>
            {activeScreen === 'home' ? 'Добавить задачу' : 'Добавить событие'}
          </button>
        </div>
        
        {/* Quick Priority Buttons */}
        {activeScreen === 'home' && (
          <div className="grid grid-cols-3 gap-2 mt-3">
            <button
              onClick={() => {
                setShowTaskForm(true);
                // Можно передать приоритет через состояние
              }}
              className="py-2 px-3 bg-white rounded-xl text-xs font-semibold text-gray-700 shadow-md hover:shadow-lg transition flex items-center justify-center gap-1"
            >
              <span>📅</span>
              <span>На сегодня</span>
            </button>
            <button
              onClick={() => {
                setShowTaskForm(true);
              }}
              className="py-2 px-3 bg-white rounded-xl text-xs font-semibold text-gray-700 shadow-md hover:shadow-lg transition flex items-center justify-center gap-1"
            >
              <span>⏰</span>
              <span>На завтра</span>
            </button>
            <button
              onClick={() => {
                setShowTaskForm(true);
              }}
              className="py-2 px-3 bg-red-50 border-2 border-red-200 rounded-xl text-xs font-semibold text-red-700 shadow-md hover:shadow-lg transition flex items-center justify-center gap-1"
            >
              <span>🔥</span>
              <span>Срочно</span>
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4">
        {/* Push Notification Setup */}
        <div className="mb-4">
          <PushNotificationSetup />
        </div>

        {/* Debug Push Status */}
        <div className="mb-4 space-y-2">
        </div>

        {activeScreen === 'home' && (
          <div>
            {/* Quick Filters */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
              {[
                { id: 'all', label: 'Все', icon: '📋', count: stats.total },
                { id: 'today', label: 'Сегодня', icon: '📅', count: stats.today },
                { id: 'high', label: 'Срочно', icon: '🔥', count: stats.highPriority },
                { id: 'active', label: 'Активные', icon: '⚡', count: stats.active },
                { id: 'completed', label: 'Готово', icon: '✅', count: stats.completed },
                { id: 'my', label: 'Мои', icon: '👤', count: stats.myTasks },
              ].map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setTaskFilter(filter.id)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                    taskFilter === filter.id
                      ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary-300'
                  }`}
                >
                  <span>{filter.icon}</span>
                  <span>{filter.label}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    taskFilter === filter.id ? 'bg-white/30' : 'bg-gray-100'
                  }`}>
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Sort Button */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                {taskFilter === 'all' ? 'Все задачи' : 
                 taskFilter === 'today' ? 'На сегодня' :
                 taskFilter === 'high' ? 'Срочные' :
                 taskFilter === 'active' ? 'Активные' :
                 taskFilter === 'completed' ? 'Выполненные' :
                 taskFilter === 'my' ? 'Мои задачи' : 'Задачи'}
              </h2>
              <button
                onClick={() => setShowSort(!showSort)}
                className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl text-sm font-medium text-gray-700 border-2 border-gray-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
                Сортировка
              </button>
            </div>

            {/* Sort Options */}
            {showSort && (
              <div className="bg-white rounded-2xl p-4 mb-4 shadow-lg border-2 border-gray-100">
                <div className="space-y-2">
                  {[
                    { id: 'date', label: 'По дате', icon: '📅' },
                    { id: 'priority', label: 'По приоритету', icon: '🔥' },
                    { id: 'status', label: 'По статусу', icon: '📊' },
                  ].map(sort => (
                    <button
                      key={sort.id}
                      onClick={() => {
                        setSortBy(sort.id);
                        setShowSort(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                        sortBy === sort.id
                          ? 'bg-primary-50 text-primary-700 font-semibold'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-xl">{sort.icon}</span>
                      <span>{sort.label}</span>
                      {sortBy === sort.id && (
                        <svg className="w-5 h-5 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tasks List */}
            <div className="space-y-3">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-7xl mb-4">
                    {searchQuery ? '🔍' : taskFilter === 'completed' ? '🎉' : '📝'}
                  </div>
                  <p className="text-gray-600 font-semibold text-lg">
                    {searchQuery ? 'Ничего не найдено' : 
                     taskFilter === 'completed' ? 'Нет выполненных задач' :
                     'Нет задач'}
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    {searchQuery ? 'Попробуйте другой запрос' : 'Добавьте первую задачу'}
                  </p>
                </div>
              ) : (
                filteredTasks.map((task: any) => (
                  <div key={task.id} onClick={() => setSelectedTask(task)}>
                    <TaskCard
                      task={task}
                      onComplete={handleCompleteTask}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeScreen === 'events' && (
          <div>
            {/* Events List */}
            <div className="space-y-3">
              {events.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-7xl mb-4">📅</div>
                  <p className="text-gray-600 font-semibold text-lg">Нет событий</p>
                  <p className="text-sm text-gray-400 mt-2">Добавьте первое событие</p>
                </div>
              ) : (
                events.map((event: any) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onClick={() => setSelectedEvent(event)}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {activeScreen === 'settings' && (
          <div>
            <div className="bg-white rounded-2xl p-6 mb-4 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Настройки</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Имя</label>
                  <div className="text-gray-900">{user?.name || 'Не указано'}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="text-gray-900">{user?.email}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Пара</label>
                  {couple ? (
                    <div className="text-gray-900">
                      {couple.members?.map((m: any) => m.user.name || m.user.email).join(' и ')}
                    </div>
                  ) : (
                    <div>
                      <div className="text-gray-500 mb-3">Вы ещё не создали пару</div>
                      <button
                        onClick={handleCreateCouple}
                        className="w-full px-4 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-semibold hover:shadow-lg transition"
                      >
                        💑 Создать пару
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="w-full mt-6 px-4 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition"
              >
                Выйти
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-100 px-4 py-2 shadow-2xl">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <button
            onClick={() => setActiveScreen('home')}
            className={`flex flex-col items-center gap-1 transition ${
              activeScreen === 'home' ? 'text-primary-600' : 'text-gray-400'
            }`}
          >
            <svg className="w-6 h-6" fill={activeScreen === 'home' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs font-semibold">Главная</span>
          </button>
          
          <Link href="/shopping" className="flex flex-col items-center gap-1 transition text-gray-400 hover:text-green-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-xs font-semibold">Покупки</span>
          </Link>
          
          <button
            onClick={() => setActiveScreen('events')}
            className={`flex flex-col items-center gap-1 transition ${
              activeScreen === 'events' ? 'text-primary-600' : 'text-gray-400'
            }`}
          >
            <svg className="w-6 h-6" fill={activeScreen === 'events' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-semibold">События</span>
          </button>
          
          <button
            onClick={() => setActiveScreen('settings')}
            className={`flex flex-col items-center gap-1 transition ${
              activeScreen === 'settings' ? 'text-primary-600' : 'text-gray-400'
            }`}
          >
            <svg className="w-6 h-6" fill={activeScreen === 'settings' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs font-semibold">Настройки</span>
          </button>
        </div>
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 overflow-x-hidden">
          <div className="bg-white w-full max-w-[95vw] rounded-3xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Sticky Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-900">Новая задача</h2>
              <button
                onClick={() => setShowTaskForm(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex-shrink-0"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              <div className="p-4">
                <TaskForm
                  onSubmit={handleCreateTask}
                  onCancel={() => setShowTaskForm(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Form Modal */}
      {showEventForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 overflow-x-hidden">
          <div className="bg-white w-full max-w-[95vw] rounded-3xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Sticky Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-900">Новое событие</h2>
              <button
                onClick={() => setShowEventForm(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex-shrink-0"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              <div className="p-4">
                <EventForm
                  onSubmit={handleCreateEvent}
                  onCancel={() => setShowEventForm(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && !editingTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 overflow-x-hidden">
          <div className="bg-white w-full max-w-[95vw] rounded-3xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Sticky Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-900">Детали задачи</h2>
              <button
                onClick={() => setSelectedTask(null)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex-shrink-0"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{selectedTask.title}</h3>
                  {selectedTask.description && (
                    <p className="text-gray-600">{selectedTask.description}</p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedTask.priority === 'high' ? 'bg-red-100 text-red-700' :
                    selectedTask.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {selectedTask.priority === 'high' ? '🔥 Высокий' :
                     selectedTask.priority === 'medium' ? '⚡ Средний' :
                     '✅ Низкий'}
                  </span>
                  
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedTask.status === 'completed' ? 'bg-green-100 text-green-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {selectedTask.status === 'completed' ? '✅ Выполнено' : '⏳ В процессе'}
                  </span>
                </div>
                
                {selectedTask.dueAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Срок</label>
                    <div className="text-gray-900">
                      {new Date(selectedTask.dueAt).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Sticky Footer */}
            <div className="flex gap-2 p-4 pt-3 border-t border-gray-100 flex-shrink-0">
              <button
                onClick={() => setEditingTask(selectedTask)}
                className="flex-1 px-3 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition text-sm"
              >
                ✏️ Редактировать
              </button>
              
              {selectedTask.status !== 'completed' && (
                <button
                  onClick={() => {
                    handleCompleteTask(selectedTask.id);
                    setSelectedTask(null);
                  }}
                  className="flex-1 px-3 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition text-sm"
                >
                  ✅ Завершить
                </button>
              )}
              
              <button
                onClick={() => handleDeleteTask(selectedTask.id)}
                className="flex-1 px-3 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition text-sm"
              >
                🗑️ Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Edit Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 overflow-x-hidden">
          <div className="bg-white w-full max-w-[95vw] rounded-3xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Sticky Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-900">Редактировать задачу</h2>
              <button
                onClick={() => {
                  setEditingTask(null);
                  setSelectedTask(null);
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex-shrink-0"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              <div className="p-4">
                <TaskForm
                  initialData={editingTask}
                  onSubmit={(data) => handleUpdateTask(editingTask.id, data)}
                  onCancel={() => {
                    setEditingTask(null);
                    setSelectedTask(null);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && !editingEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 overflow-x-hidden">
          <div className="bg-white w-full max-w-[95vw] rounded-3xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Sticky Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-900">Детали события</h2>
              <button
                onClick={() => setSelectedEvent(null)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex-shrink-0"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedEvent.title}</h3>
                  {selectedEvent.description && (
                    <p className="text-gray-600">{selectedEvent.description}</p>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-secondary-50 rounded-xl">
                    <div className="w-10 h-10 bg-secondary-500 rounded-lg flex items-center justify-center text-white text-xl">
                      📅
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Начало</div>
                      <div className="font-semibold text-gray-900">
                        {new Date(selectedEvent.startAt).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          hour: selectedEvent.allDay ? undefined : '2-digit',
                          minute: selectedEvent.allDay ? undefined : '2-digit'
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-secondary-50 rounded-xl">
                    <div className="w-10 h-10 bg-secondary-500 rounded-lg flex items-center justify-center text-white text-xl">
                      🏁
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Конец</div>
                      <div className="font-semibold text-gray-900">
                        {new Date(selectedEvent.endAt).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          hour: selectedEvent.allDay ? undefined : '2-digit',
                          minute: selectedEvent.allDay ? undefined : '2-digit'
                        })}
                      </div>
                    </div>
                  </div>

                  {selectedEvent.location && (
                    <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl">
                      <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center text-white text-xl">
                        📍
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Место</div>
                        <div className="font-semibold text-gray-900">{selectedEvent.location}</div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl">
                      {selectedEvent.participants === 'both' ? '👥' : selectedEvent.participants === 'me' ? '👤' : '💑'}
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Участники</div>
                      <div className="font-semibold text-gray-900">
                        {selectedEvent.participants === 'both' ? 'Оба' : selectedEvent.participants === 'me' ? 'Я' : 'Партнёр'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-400">
                    Создал: {selectedEvent.createdBy.name || selectedEvent.createdBy.email.split('@')[0]}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sticky Footer */}
            <div className="flex gap-2 p-4 pt-3 border-t border-gray-100 flex-shrink-0">
              <button
                onClick={() => setEditingEvent(selectedEvent)}
                className="flex-1 px-3 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition text-sm"
              >
                ✏️ Редактировать
              </button>
              
              <button
                onClick={() => handleDeleteEvent(selectedEvent.id)}
                className="flex-1 px-3 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition text-sm"
              >
                🗑️ Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Edit Modal */}
      {editingEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 overflow-x-hidden">
          <div className="bg-white w-full max-w-[95vw] rounded-3xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Sticky Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-900">Редактировать событие</h2>
              <button
                onClick={() => {
                  setEditingEvent(null);
                  setSelectedEvent(null);
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex-shrink-0"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              <div className="p-4">
                <EventForm
                  initialData={editingEvent}
                  onSubmit={(data) => handleUpdateEvent(editingEvent.id, data)}
                  onCancel={() => {
                    setEditingEvent(null);
                    setSelectedEvent(null);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="text-lg">Загрузка...</div></div>}>
      <DashboardContent />
    </Suspense>
  );
}
