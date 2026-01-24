'use client';

import { useState, useRef, TouchEvent } from 'react';

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    dueAt: Date | null;
    assigneeType: string;
    isShared: boolean;
    owner: {
      name: string | null;
      email: string;
    };
  };
  onComplete: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function TaskCard({ task, onComplete, onDelete }: TaskCardProps) {
  const [translateX, setTranslateX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);

  const priorityColors = {
    low: 'bg-green-50 text-green-700 border-green-200',
    medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    high: 'bg-red-50 text-red-700 border-red-200',
  };

  const statusColors = {
    new: 'bg-blue-50 text-blue-700 border-blue-200',
    in_progress: 'bg-purple-50 text-purple-700 border-purple-200',
    completed: 'bg-green-50 text-green-700 border-green-200',
    postponed: 'bg-gray-50 text-gray-700 border-gray-200',
  };

  const handleTouchStart = (e: TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isSwiping) return;
    currentX.current = e.touches[0].clientX;
    const diff = currentX.current - startX.current;
    
    // Только свайп влево для удаления
    if (diff < 0) {
      setTranslateX(Math.max(diff, -100));
    }
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    
    // Если свайпнули больше чем на 60px - удаляем
    if (translateX < -60 && onDelete) {
      onDelete(task.id);
    } else {
      // Возвращаем на место
      setTranslateX(0);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Фон с кнопкой удаления */}
      <div className="absolute inset-0 bg-red-500 flex items-center justify-end pr-6">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </div>

      {/* Карточка задачи */}
      <div
        className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-5 border border-gray-100 relative"
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isSwiping ? 'none' : 'transform 0.3s ease-out',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg">{task.title}</h3>
            {task.description && (
              <p className="text-sm text-gray-600 mt-2">{task.description}</p>
            )}
          </div>
          {task.status !== 'completed' && (
            <button
              onClick={() => onComplete(task.id)}
              className="ml-3 text-gray-400 hover:text-green-600 transition"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <span className={`text-xs px-3 py-1.5 rounded-lg border font-medium ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
            {task.priority === 'low' ? 'Низкий' : task.priority === 'medium' ? 'Средний' : 'Высокий'}
          </span>
          <span className={`text-xs px-3 py-1.5 rounded-lg border font-medium ${statusColors[task.status as keyof typeof statusColors]}`}>
            {task.status === 'new' ? 'Новая' : task.status === 'in_progress' ? 'В работе' : task.status === 'completed' ? 'Завершена' : 'Отложена'}
          </span>
          {task.isShared && (
            <span className="text-xs px-3 py-1.5 rounded-lg bg-primary-50 text-primary-700 border border-primary-200 font-medium">
              Общая
            </span>
          )}
          <span className="text-xs px-3 py-1.5 rounded-lg bg-gray-50 text-gray-700 border border-gray-200 font-medium">
            {task.assigneeType === 'me' ? 'Я' : task.assigneeType === 'partner' ? 'Партнёр' : 'Оба'}
          </span>
        </div>

        {task.dueAt && (
          <div className="text-xs text-gray-500 mt-3 flex items-center gap-1">
            <span>📅</span>
            <span>{new Date(task.dueAt).toLocaleDateString('ru-RU')}</span>
          </div>
        )}

        <div className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
          Создал: {task.owner.name || task.owner.email}
        </div>
      </div>
    </div>
  );
}
