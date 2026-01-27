'use client';

import { useState } from 'react';

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
    requiresApproval?: boolean;
    approvalStatus?: string | null;
    owner: {
      name: string | null;
      email: string;
    };
  };
  currentUserId?: string;
  partnerName?: string;
  onComplete: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function TaskCard({ task, currentUserId, partnerName, onComplete }: TaskCardProps) {
  const [showToast, setShowToast] = useState(false);

  const priorityColors = {
    low: 'bg-green-50 text-green-700 border-green-200',
    medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    high: 'bg-red-50 text-red-700 border-red-200',
  };

  const priorityBorderColors = {
    low: 'border-l-green-400',
    medium: 'border-l-yellow-400',
    high: 'border-l-red-500',
  };

  const statusColors = {
    new: 'bg-blue-50 text-blue-700 border-blue-200',
    in_progress: 'bg-purple-50 text-purple-700 border-purple-200',
    completed: 'bg-green-50 text-green-700 border-green-200',
    postponed: 'bg-gray-50 text-gray-700 border-gray-200',
  };

  const approvalStatusConfig = {
    pending: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      icon: '⏳',
      label: 'Ожидает подтверждения'
    },
    approved: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
      icon: '✅',
      label: 'Принято'
    },
    declined: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      icon: '❌',
      label: 'Отклонено'
    }
  };

  const isUrgent = task.dueAt && new Date(task.dueAt) <= new Date(Date.now() + 24 * 60 * 60 * 1000);
  const isPending = task.status === 'new';

  const handleComplete = () => {
    onComplete(task.id);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <>
      <div className={`rounded-xl shadow-md hover:shadow-lg transition-all p-5 border-l-4 border animate-scaleIn ${
        task.status === 'completed' 
          ? 'bg-green-50 border-green-200 border-l-green-400' 
          : `bg-white border-gray-100 ${priorityBorderColors[task.priority as keyof typeof priorityBorderColors]}`
      } ${isPending ? 'bg-gray-50/50' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {isUrgent && task.status !== 'completed' && (
              <span className="text-red-500 text-lg" title="Срочно">⏰</span>
            )}
            {isPending && (
              <span className="text-gray-400 text-lg" title="Ожидает начала">⏳</span>
            )}
            <h3 className="font-semibold text-gray-900 text-lg">{task.title}</h3>
          </div>
          {task.description && (
            <p className="text-sm text-gray-600 mt-2">{task.description}</p>
          )}
        </div>
        {task.status !== 'completed' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleComplete();
            }}
            className="ml-3 text-gray-400 hover:text-green-600 hover:scale-110 transition-all duration-200 active:scale-95"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
        )}
        {task.status === 'completed' && (
          <div className="ml-3 text-green-600 animate-pulse">
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        <span className={`text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1 ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
          {task.priority === 'high' && '🔥'}
          {task.priority === 'low' ? 'Низкий' : task.priority === 'medium' ? 'Средний' : 'Высокий'}
        </span>
        <span className={`text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1 ${statusColors[task.status as keyof typeof statusColors]}`}>
          {task.status === 'new' && '⏳'}
          {task.status === 'in_progress' && '▶️'}
          {task.status === 'completed' && '✅'}
          {task.status === 'new' ? 'Новая' : task.status === 'in_progress' ? 'В работе' : task.status === 'completed' ? 'Завершена' : 'Отложена'}
        </span>
        {task.isShared && (
          <span className="text-xs px-3 py-1.5 rounded-lg bg-primary-50 text-primary-700 border border-primary-200 font-medium flex items-center gap-1">
            💜 Общая
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

      {/* Approval Status */}
      {task.requiresApproval && task.approvalStatus && (
        <div className={`mt-3 px-3 py-2 rounded-lg border flex items-center gap-2 ${
          approvalStatusConfig[task.approvalStatus as keyof typeof approvalStatusConfig]?.bg || ''
        } ${
          approvalStatusConfig[task.approvalStatus as keyof typeof approvalStatusConfig]?.border || ''
        }`}>
          <span className="text-lg">
            {approvalStatusConfig[task.approvalStatus as keyof typeof approvalStatusConfig]?.icon}
          </span>
          <span className={`text-xs font-medium ${
            approvalStatusConfig[task.approvalStatus as keyof typeof approvalStatusConfig]?.text || ''
          }`}>
            {task.approvalStatus === 'pending' && partnerName
              ? `Ожидает подтверждения ${partnerName}`
              : approvalStatusConfig[task.approvalStatus as keyof typeof approvalStatusConfig]?.label
            }
          </span>
        </div>
      )}

      <div className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
        Создал: {task.owner.name || task.owner.email}
      </div>
    </div>

    {/* Toast уведомление */}
    {showToast && (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
        <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <span className="text-xl">🎉</span>
          <span className="font-medium">Задача выполнена!</span>
        </div>
      </div>
    )}
    </>
  );
}
