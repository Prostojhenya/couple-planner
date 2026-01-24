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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="text-center space-y-8 p-8 max-w-2xl">
        <div className="space-y-4">
          <div className="text-7xl mb-4">💑</div>
          <h1 className="text-7xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            TwoDo
          </h1>
          <p className="text-2xl text-gray-700 max-w-md mx-auto font-medium">
            Планируйте вместе, живите лучше
          </p>
          <p className="text-lg text-gray-500 max-w-lg mx-auto">
            Совместное приложение для пар: задачи, события, списки покупок и важные даты в одном месте
          </p>
        </div>
        
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/auth/register"
            className="px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:shadow-2xl transition-all transform hover:scale-105 font-bold text-lg"
          >
            Начать бесплатно
          </Link>
          <Link
            href="/auth/login"
            className="px-10 py-4 bg-white text-purple-600 border-2 border-purple-600 rounded-2xl hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl font-bold text-lg"
          >
            Войти
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-16">
          <div className="bg-white/80 backdrop-blur p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all">
            <div className="text-4xl mb-3">✅</div>
            <h3 className="font-bold text-gray-900 mb-2">Задачи</h3>
            <p className="text-sm text-gray-600">Общие и личные дела</p>
          </div>
          <div className="bg-white/80 backdrop-blur p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all">
            <div className="text-4xl mb-3">📅</div>
            <h3 className="font-bold text-gray-900 mb-2">События</h3>
            <p className="text-sm text-gray-600">Важные даты и встречи</p>
          </div>
          <div className="bg-white/80 backdrop-blur p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all">
            <div className="text-4xl mb-3">🛒</div>
            <h3 className="font-bold text-gray-900 mb-2">Покупки</h3>
            <p className="text-sm text-gray-600">Общий список покупок</p>
          </div>
          <div className="bg-white/80 backdrop-blur p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all">
            <div className="text-4xl mb-3">🔔</div>
            <h3 className="font-bold text-gray-900 mb-2">Push-уведомления</h3>
            <p className="text-sm text-gray-600">Всегда в курсе</p>
          </div>
        </div>

        <div className="mt-12 text-sm text-gray-500">
          <p>🌟 PWA приложение • 📱 Работает на всех устройствах • 🔒 Безопасно</p>
        </div>
      </div>
    </div>
  );
}
