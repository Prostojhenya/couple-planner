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
  { name: 'Маленький', value: 80 },
  { name: 'Средний', value: 96 },
  { name: 'Большой', value: 112 },
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
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 my-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Новый кластер</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Name Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Название
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Например: Работа, Дом, Хобби..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
        </div>

        {/* Size Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Размер
          </label>
          <div className="grid grid-cols-3 gap-3">
            {SIZES.map((s) => (
              <button
                key={s.value}
                onClick={() => setSize(s.value)}
                className={`p-3 rounded-xl border-2 transition ${
                  size === s.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-sm font-medium text-gray-900">{s.name}</div>
                <div className="text-xs text-gray-500 mt-1">{s.value}px</div>
              </button>
            ))}
          </div>
        </div>

        {/* Color Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Цвет
          </label>
          <div className="grid grid-cols-6 gap-3">
            {COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => setColor(c.value)}
                className={`w-12 h-12 rounded-full transition ${
                  color === c.value ? 'ring-4 ring-offset-2 ring-blue-500' : ''
                }`}
                style={{ backgroundColor: c.value }}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <div className="text-xs text-gray-500 mb-2 text-center">Предпросмотр</div>
          <div className="flex justify-center">
            <div
              className="rounded-full shadow-lg flex items-center justify-center text-white font-bold"
              style={{
                width: size,
                height: size,
                backgroundColor: color,
              }}
            >
              {name || '?'}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition font-medium"
          >
            Отмена
          </button>
          <button
            onClick={handleCreate}
            className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition font-medium"
          >
            Создать
          </button>
        </div>
      </div>
    </div>
  );
}
