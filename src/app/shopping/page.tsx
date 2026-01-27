'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ShoppingPage() {
  const router = useRouter();
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewList, setShowNewList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [selectedList, setSelectedList] = useState<any>(null);
  const [newItemName, setNewItemName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [needsCouple, setNeedsCouple] = useState(false);
  const [editingList, setEditingList] = useState<any>(null);
  const [editListName, setEditListName] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    loadLists();
    
    // Автоматическое обновление каждые 5 секунд
    const interval = setInterval(() => {
      loadLists();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const loadLists = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/shopping', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLists(data);
        setNeedsCouple(false);
        if (data.length > 0 && !selectedList) {
          setSelectedList(data[0]);
        }
      } else if (res.status === 400) {
        setNeedsCouple(true);
      }
    } catch (err) {
      console.error('Ошибка загрузки списков', err);
    } finally {
      setLoading(false);
    }
  };

  const createList = async () => {
    if (!newListName.trim()) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/shopping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newListName }),
      });
      
      if (res.ok) {
        setNewListName('');
        setShowNewList(false);
        loadLists();
      } else {
        const error = await res.json();
        alert(`Ошибка: ${error.error || 'Не удалось создать список'}`);
      }
    } catch (err) {
      console.error('Ошибка создания списка', err);
      alert('Ошибка создания списка. Проверьте подключение.');
    }
  };

  const addItem = async () => {
    if (!newItemName.trim() || !selectedList) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/shopping/${selectedList.id}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newItemName,
        }),
      });
      if (res.ok) {
        setNewItemName('');
        loadLists();
      }
    } catch (err) {
      console.error('Ошибка добавления товара', err);
    }
  };

  const toggleItem = async (itemId: string, isPurchased: boolean) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/shopping/items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ isPurchased: !isPurchased }),
      });
      if (res.ok) {
        loadLists();
      }
    } catch (err) {
      console.error('Ошибка обновления товара', err);
    }
  };

  const deleteItem = async (itemId: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/shopping/items/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        loadLists();
      }
    } catch (err) {
      console.error('Ошибка удаления товара', err);
    }
  };

  const deleteList = async () => {
    if (!selectedList) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/shopping/${selectedList.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        setSelectedList(null);
        setShowDeleteConfirm(false);
        loadLists();
      }
    } catch (err) {
      console.error('Ошибка удаления списка', err);
    }
  };

  const updateList = async () => {
    if (!editingList || !editListName.trim()) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/shopping/${editingList.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editListName }),
      });
      
      if (res.ok) {
        setEditingList(null);
        setEditListName('');
        loadLists();
      } else {
        const error = await res.json();
        alert(`Ошибка: ${error.error || 'Не удалось обновить список'}`);
      }
    } catch (err) {
      console.error('Ошибка обновления списка', err);
      alert('Ошибка обновления списка');
    }
  };

  const currentList = lists.find(l => l.id === selectedList?.id) || selectedList;
  const items = currentList?.items || [];
  const purchasedItems = items.filter((i: any) => i.isPurchased);
  const unpurchasedItems = items.filter((i: any) => !i.isPurchased);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pb-20 overflow-x-hidden" style={{ margin: 0, padding: 0, paddingBottom: '5rem', maxWidth: '100vw' }}>
      {/* Header */}
      <div className="header-fullscreen bg-gradient-to-br from-green-600 via-green-500 to-blue-500 text-white px-6 pb-8 rounded-b-[2.5rem] shadow-2xl" style={{ paddingTop: 'calc(3rem + env(safe-area-inset-top))' }}>
        <div className="flex items-center justify-between gap-3 mb-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center hover:bg-white/30 transition flex-shrink-0"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold flex-1 text-center">🛒 Списки</h1>
          <div className="flex gap-2 flex-shrink-0">{loading && (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          )}
            {selectedList && (
              <>
                <button
                  onClick={() => {
                    setEditingList(selectedList);
                    setEditListName(selectedList.name);
                  }}
                  className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center hover:bg-white/30 transition"
                  title="Редактировать список"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center hover:bg-red-500/50 transition"
                  title="Удалить список"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </>
            )}
            <button
              onClick={() => setShowNewList(true)}
              className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center hover:bg-white/30 transition"
              title="Новый список"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Lists Tabs */}
        {lists.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {lists.map(list => (
              <button
                key={list.id}
                onClick={() => setSelectedList(list)}
                className={`px-3 py-2 rounded-xl font-semibold transition flex-shrink-0 ${
                  selectedList?.id === list.id
                    ? 'bg-white text-green-600 shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <div className="text-sm max-w-[150px] truncate">{list.name}</div>
                <div className="text-xs opacity-75 mt-0.5">({list.items?.length || 0})</div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 mt-6">
        {needsCouple ? (
          <div className="text-center py-20">
            <div className="text-7xl mb-4">💑</div>
            <p className="text-gray-600 font-semibold text-lg mb-2">Создайте пару</p>
            <p className="text-sm text-gray-400 mb-6">Для использования списков покупок нужно создать пространство для двоих</p>
            <button
              onClick={() => router.push('/onboarding')}
              className="px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition"
            >
              Создать пару
            </button>
          </div>
        ) : lists.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-7xl mb-4">🛒</div>
            <p className="text-gray-600 font-semibold text-lg">Пока нет общих списков</p>
            <p className="text-sm text-gray-400 mt-2">Создайте первый список покупок вместе</p>
          </div>
        ) : currentList ? (
          <div>
            {/* Add Item Form */}
            <div className="bg-white rounded-2xl p-4 mb-4 shadow-lg">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addItem()}
                  placeholder="Добавить товар..."
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                />
                <button
                  onClick={addItem}
                  disabled={!newItemName.trim()}
                  className="px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            </div>

            {/* Progress */}
            {items.length > 0 && (
              <div className="bg-white rounded-2xl p-4 mb-4 shadow-lg">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Прогресс</span>
                  <span className="font-bold">{purchasedItems.length} / {items.length}</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${items.length > 0 ? (purchasedItems.length / items.length) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Unpurchased Items */}
            {unpurchasedItems.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Нужно купить</h3>
                <div className="space-y-2">
                  {unpurchasedItems.map((item: any) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl p-4 shadow-md flex items-center gap-3"
                    >
                      <button
                        onClick={() => toggleItem(item.id, item.isPurchased)}
                        className="w-6 h-6 border-2 border-gray-300 rounded-full hover:border-green-500 transition"
                      ></button>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{item.name}</div>
                      </div>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Purchased Items */}
            {purchasedItems.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Куплено ✅</h3>
                <div className="space-y-2">
                  {purchasedItems.map((item: any) => (
                    <div
                      key={item.id}
                      className="bg-gray-50 rounded-xl p-4 flex items-center gap-3 opacity-60"
                    >
                      <button
                        onClick={() => toggleItem(item.id, item.isPurchased)}
                        className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white"
                      >
                        ✓
                      </button>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 line-through">{item.name}</div>
                      </div>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {items.length === 0 && (
              <div className="text-center py-20">
                <div className="text-7xl mb-4">🛒</div>
                <p className="text-gray-600 font-semibold text-lg">Пока ничего не запланировали вместе</p>
                <p className="text-sm text-gray-400 mt-2">Добавьте первый товар в список</p>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* New List Modal */}
      {showNewList && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Новый список</h2>
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createList()}
              placeholder="Название списка"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowNewList(false);
                  setNewListName('');
                }}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition"
              >
                Отмена
              </button>
              <button
                onClick={createList}
                className="flex-1 px-4 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition"
              >
                Создать
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit List Modal */}
      {editingList && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Редактировать список</h2>
            <input
              type="text"
              value={editListName}
              onChange={(e) => setEditListName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && updateList()}
              placeholder="Название списка"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEditingList(null);
                  setEditListName('');
                }}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition"
              >
                Отмена
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition"
              >
                🗑️
              </button>
              <button
                onClick={updateList}
                className="flex-1 px-4 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Удалить список?</h2>
            <p className="text-gray-600 mb-6">Все товары в списке будут удалены. Это действие нельзя отменить.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  deleteList();
                  setEditingList(null);
                }}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-100 px-4 py-2 shadow-2xl">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <Link href="/dashboard" className="flex flex-col items-center gap-1 transition text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs font-semibold">Главная</span>
          </Link>
          
          <div className="flex flex-col items-center gap-1 transition text-primary-600">
            <svg className="w-6 h-6" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-xs font-semibold">Покупки</span>
          </div>
          
          <Link href="/dashboard?screen=events" className="flex flex-col items-center gap-1 transition text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-semibold">События</span>
          </Link>
          
          <Link href="/dashboard?screen=settings" className="flex flex-col items-center gap-1 transition text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs font-semibold">Настройки</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
