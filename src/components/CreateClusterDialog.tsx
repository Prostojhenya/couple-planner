'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface CreateClusterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { name: string; size: number; color: string }) => void;
}

const COLORS = [
  { name: 'Синий', value: '#3B82F6' },
  { name: 'Зелёный', value: '#10B981' },
  { name: 'Фиолетовый', value: '#8B5CF6' },
  { name: 'Розовый', value: '#EC4899' },
  { name: 'Оранжевый', value: '#F59E0B' },
  { name: 'Красный', value: '#EF4444' },
];

const SIZES = [
  { name: 'S', value: 80 },
  { name: 'M', value: 96 },
  { name: 'L', value: 112 },
];

export function CreateClusterDialog({ isOpen, onClose, onCreate }: CreateClusterDialogProps) {
  const [name, setName] = useState('');
  const [size, setSize] = useState(96);
  const [color, setColor] = useState('#3B82F6');

  if (!isOpen) return null;

  const handleCreate = () => {
    if (!name.trim()) {
      alert('Введите название кластера');
      return;
    }
    onCreate({ name: name.trim(), size, color });
    setName('');
    setSize(96);
    setColor('#3B82F6');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-4 mt-4 mb-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Новый кластер</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Name Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Название
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Работа, Дом, Хобби..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
            autoFocus
          />
        </div>

        {/* Size Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Размер
          </label>
          <div className="grid grid-cols-3 gap-2">
            {SIZES.map((s) => (
              <button
                key={s.value}
                onClick={() => setSize(s.value)}
                className={`p-2 rounded-lg border-2 transition text-sm font-medium ${
                  size === s.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {/* Color Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Цвет
          </label>
          <div className="grid grid-cols-6 gap-2">
            {COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => setColor(c.value)}
                className={`w-10 h-10 rounded-full transition ${
                  color === c.value ? 'ring-4 ring-offset-1 ring-blue-500' : ''
                }`}
                style={{ backgroundColor: c.value }}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
          >
            Отмена
          </button>
          <button
            onClick={handleCreate}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium text-sm"
          >
            Создать
          </button>
        </div>
      </div>
    </div>
  );
}
