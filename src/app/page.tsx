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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="text-center space-y-8 p-8 max-w-2xl">
        <div className="space-y-4">
          <div className="text-6xl mb-4">💑</div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            Планер для двоих
          </h1>
          <p className="text-xl text-gray-600 max-w-md mx-auto">
            Совместное планирование задач и событий для пар
          </p>
        </div>
        
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/auth/login"
            className="px-8 py-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition shadow-lg hover:shadow-xl font-semibold"
          >
            Войти
          </Link>
          <Link
            href="/auth/register"
            className="px-8 py-4 bg-white text-primary-600 border-2 border-primary-600 rounded-xl hover:bg-primary-50 transition shadow-lg hover:shadow-xl font-semibold"
          >
            Регистрация
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-3xl mb-3">✅</div>
            <h3 className="font-semibold text-gray-900 mb-2">Общие задачи</h3>
            <p className="text-sm text-gray-600">Планируйте дела вместе</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-3xl mb-3">📅</div>
            <h3 className="font-semibold text-gray-900 mb-2">Календарь</h3>
            <p className="text-sm text-gray-600">События и встречи</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-3xl mb-3">🔔</div>
            <h3 className="font-semibold text-gray-900 mb-2">Уведомления</h3>
            <p className="text-sm text-gray-600">Не пропустите важное</p>
          </div>
        </div>
      </div>
    </div>
  );
}
