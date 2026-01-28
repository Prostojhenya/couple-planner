'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Проверяем токен и редиректим на dashboard если пользователь залогинен
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      <div className="text-center space-y-6 max-w-4xl w-full">
        <div className="space-y-2">
          <div className="text-5xl mb-2">💑</div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            TwoDo
          </h1>
          <p className="text-lg md:text-xl text-gray-700 font-medium">
            Планируйте вместе, живите лучше
          </p>
        </div>
        
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/auth/register"
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-xl transition-all transform hover:scale-105 font-bold"
          >
            Начать бесплатно
          </Link>
          <Link
            href="/auth/login"
            className="px-8 py-3 bg-white text-purple-600 border-2 border-purple-600 rounded-xl hover:bg-purple-50 transition-all shadow-md hover:shadow-lg font-bold"
          >
            Войти
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <div className="bg-white/80 backdrop-blur p-4 rounded-xl shadow-md hover:shadow-lg transition-all">
            <div className="text-3xl mb-1">✅</div>
            <h3 className="font-bold text-gray-900 text-sm">Задачи</h3>
            <p className="text-xs text-gray-600">Общие дела</p>
          </div>
          <div className="bg-white/80 backdrop-blur p-4 rounded-xl shadow-md hover:shadow-lg transition-all">
            <div className="text-3xl mb-1">📅</div>
            <h3 className="font-bold text-gray-900 text-sm">События</h3>
            <p className="text-xs text-gray-600">Важные даты</p>
          </div>
          <div className="bg-white/80 backdrop-blur p-4 rounded-xl shadow-md hover:shadow-lg transition-all">
            <div className="text-3xl mb-1">🛒</div>
            <h3 className="font-bold text-gray-900 text-sm">Покупки</h3>
            <p className="text-xs text-gray-600">Общий список</p>
          </div>
          <div className="bg-white/80 backdrop-blur p-4 rounded-xl shadow-md hover:shadow-lg transition-all">
            <div className="text-3xl mb-1">🔔</div>
            <h3 className="font-bold text-gray-900 text-sm">Уведомления</h3>
            <p className="text-xs text-gray-600">Всегда в курсе</p>
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          <p>🌟 PWA приложение • 📱 Все устройства • 🔒 Безопасно</p>
        </div>
      </div>
    </div>
  );
}
