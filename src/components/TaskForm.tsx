'use client';

import { useState } from 'react';

interface TaskFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

export default function TaskForm({ onSubmit, onCancel, initialData }: TaskFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [isShared, setIsShared] = useState(initialData?.isShared || false);
  const [requiresApproval, setRequiresApproval] = useState(initialData?.requiresApproval || false);
  const [priority, setPriority] = useState(initialData?.priority || 'medium');
  const [assigneeType, setAssigneeType] = useState(initialData?.assigneeType || 'me');
  const [dueAt, setDueAt] = useState(
    initialData?.dueAt ? new Date(initialData.dueAt).toISOString().slice(0, 16) : ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      isShared,
      requiresApproval,
      priority,
      assigneeType,
      dueAt: dueAt || undefined,
    });
  };

  const setQuickDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    date.setHours(23, 59, 0, 0);
    const formatted = date.toISOString().slice(0, 16);
    setDueAt(formatted);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Название *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition text-sm"
          placeholder="Например: Купить продукты"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Описание
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition text-sm"
          rows={2}
          placeholder="Дополнительная информация..."
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Приоритет
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setPriority('low')}
            className={`py-2.5 px-2 rounded-xl font-semibold transition-all ${
              priority === 'low'
                ? 'bg-green-500 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="text-lg mb-0.5">✅</div>
            <div className="text-xs">Низкий</div>
          </button>
          <button
            type="button"
            onClick={() => setPriority('medium')}
            className={`py-2.5 px-2 rounded-xl font-semibold transition-all ${
              priority === 'medium'
                ? 'bg-yellow-500 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="text-lg mb-0.5">⚡</div>
            <div className="text-xs">Средний</div>
          </button>
          <button
            type="button"
            onClick={() => setPriority('high')}
            className={`py-2.5 px-2 rounded-xl font-semibold transition-all ${
              priority === 'high'
                ? 'bg-red-500 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="text-lg mb-0.5">🔥</div>
            <div className="text-xs">Срочно</div>
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Ответственный
        </label>
        <select
          value={assigneeType}
          onChange={(e) => setAssigneeType(e.target.value)}
          className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition text-sm"
        >
          <option value="me">👤 Я</option>
          <option value="partner">💑 Партнёр</option>
          <option value="both">👥 Оба</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Дедлайн
        </label>
        
        {/* Quick Date Buttons and Calendar Input */}
        <div className="grid grid-cols-3 gap-2 mb-2">
          <button
            type="button"
            onClick={() => setQuickDate(0)}
            className={`py-2.5 px-2 rounded-xl text-xs font-semibold transition-all ${
              dueAt && new Date(dueAt).toDateString() === new Date().toDateString()
                ? 'bg-primary-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📅 Сегодня
          </button>
          <button
            type="button"
            onClick={() => setQuickDate(1)}
            className={`py-2.5 px-2 rounded-xl text-xs font-semibold transition-all ${
              dueAt && new Date(dueAt).toDateString() === new Date(Date.now() + 86400000).toDateString()
                ? 'bg-primary-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ⏰ Завтра
          </button>
          <button
            type="button"
            onClick={() => setQuickDate(7)}
            className="py-2 px-1.5 rounded-xl text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
          >
            📆 Неделя
          </button>
        </div>

        {/* Calendar Input - Same Width as Buttons */}
        <div className="grid grid-cols-3 gap-2 mb-2">
          <input
            type="datetime-local"
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
            className="col-span-3 px-2 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition text-xs"
          />
        </div>

        {/* Selected Date Display */}
        {dueAt && (
          <div className="flex items-center justify-between p-2.5 bg-primary-50 border-2 border-primary-200 rounded-xl">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-base flex-shrink-0">📅</span>
              <span className="text-xs font-semibold text-primary-900 truncate">
                {new Date(dueAt).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setDueAt('')}
              className="text-primary-600 hover:text-primary-800 font-semibold text-xs flex-shrink-0 ml-2"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
        <input
          type="checkbox"
          id="isShared"
          checked={isShared}
          onChange={(e) => setIsShared(e.target.checked)}
          className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
        />
        <label htmlFor="isShared" className="text-xs font-medium text-gray-900 cursor-pointer">
          Общая задача (видна партнёру)
        </label>
      </div>

      <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl">
        <input
          type="checkbox"
          id="requiresApproval"
          checked={requiresApproval}
          onChange={(e) => setRequiresApproval(e.target.checked)}
          className="w-4 h-4 text-amber-600 rounded focus:ring-2 focus:ring-amber-500"
        />
        <label htmlFor="requiresApproval" className="text-xs font-medium text-gray-900 cursor-pointer">
          ⏳ Требует подтверждения партнёра
        </label>
      </div>

      {/* Sticky Footer with Submit Button */}
      <div className="sticky bottom-0 left-0 right-0 bg-white pt-3 pb-2 border-t border-gray-100 -mx-4 px-4 mt-4">
        <button
          type="submit"
          className="w-full py-3.5 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 transition font-bold text-base shadow-lg active:scale-95"
        >
          {initialData ? 'Сохранить изменения' : 'Создать задачу'}
        </button>
      </div>
    </form>
  );
}
