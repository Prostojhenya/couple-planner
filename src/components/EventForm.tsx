'use client';

import { useState } from 'react';

interface EventFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

export default function EventForm({ onSubmit, onCancel, initialData }: EventFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [startAt, setStartAt] = useState(
    initialData?.startAt ? new Date(initialData.startAt).toISOString().slice(0, 16) : ''
  );
  const [endAt, setEndAt] = useState(
    initialData?.endAt ? new Date(initialData.endAt).toISOString().slice(0, 16) : ''
  );
  const [allDay, setAllDay] = useState(initialData?.allDay || false);
  const [requiresApproval, setRequiresApproval] = useState(initialData?.requiresApproval || false);
  const [location, setLocation] = useState(initialData?.location || '');
  const [participants, setParticipants] = useState(initialData?.participants || 'both');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Проверка, что дата окончания после даты начала
    if (startAt && endAt && new Date(endAt) < new Date(startAt)) {
      alert('Дата окончания должна быть после даты начала');
      return;
    }
    
    onSubmit({
      title,
      description: description || undefined,
      startAt,
      endAt,
      allDay,
      requiresApproval,
      location: location || undefined,
      participants,
    });
  };

  const setQuickDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    date.setHours(10, 0, 0, 0);
    const start = date.toISOString().slice(0, 16);
    date.setHours(12, 0, 0, 0);
    const end = date.toISOString().slice(0, 16);
    setStartAt(start);
    setEndAt(end);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1.5">
            Название *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 transition text-sm"
            placeholder="Например: Ужин в ресторане"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1.5">
            Описание
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 transition text-sm"
            rows={2}
            placeholder="Дополнительная информация..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1.5">
            Когда
          </label>
          
          {/* Quick Date Buttons */}
          <div className="grid grid-cols-3 gap-2 mb-2">
            <button
              type="button"
              onClick={() => setQuickDate(0)}
              className="py-2 px-1.5 rounded-xl text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
            >
              📅 Сегодня
            </button>
            <button
              type="button"
              onClick={() => setQuickDate(1)}
              className="py-2 px-1.5 rounded-xl text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
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

          <div className="space-y-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Начало *
              </label>
              <input
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                className="w-full px-2 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary-500 transition text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Конец *
              </label>
              <input
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                className="w-full px-2 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary-500 transition text-xs"
                required
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1.5">
            Место
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary-500 transition text-sm"
            placeholder="Адрес или название места"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1.5">
            Участники
          </label>
          <select
            value={participants}
            onChange={(e) => setParticipants(e.target.value)}
            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary-500 transition text-sm"
          >
            <option value="me">👤 Я</option>
            <option value="partner">💑 Партнёр</option>
            <option value="both">👥 Оба</option>
          </select>
        </div>

        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
          <input
            type="checkbox"
            id="allDay"
            checked={allDay}
            onChange={(e) => setAllDay(e.target.checked)}
            className="w-4 h-4 text-secondary-600 rounded focus:ring-2 focus:ring-secondary-500"
          />
          <label htmlFor="allDay" className="text-xs font-medium text-gray-900 cursor-pointer">
            Весь день
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
      </div>

      {/* Sticky Footer with Submit Button */}
      <div className="sticky bottom-0 left-0 right-0 bg-white pt-3 pb-2 border-t border-gray-100 -mx-4 px-4 mt-4">
        <button
          type="submit"
          className="w-full py-3.5 bg-secondary-600 text-white rounded-2xl hover:bg-secondary-700 transition font-bold text-base shadow-lg active:scale-95"
        >
          {initialData ? 'Сохранить изменения' : 'Создать событие'}
        </button>
      </div>
    </form>
  );
}
