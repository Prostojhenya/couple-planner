'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [inviteUrl, setInviteUrl] = useState('');
  const [error, setError] = useState('');

  const createCouple = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      console.log('Creating couple with token:', token ? 'exists' : 'missing');
      
      const res = await fetch('/api/couple/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Response data:', data);

      if (!res.ok) {
        setError(data.error || 'Ошибка создания пары');
        setLoading(false);
        return;
      }

      alert('Пара успешно создана!');
      setStep(2);
    } catch (err) {
      console.error('Error creating couple:', err);
      setError('Ошибка соединения');
    } finally {
      setLoading(false);
    }
  };

  const sendInvite = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/couple/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ email: inviteEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Ошибка отправки приглашения');
        return;
      }

      setInviteUrl(data.inviteUrl);
      setStep(3);
    } catch (err) {
      setError('Ошибка соединения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Настройка пары
        </h1>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <p className="text-gray-600 text-center">
              Создайте пространство для совместного планирования
            </p>
            <button
              onClick={() => {
                console.log('Button clicked!');
                alert('Кнопка нажата!');
                createCouple();
              }}
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
            >
              {loading ? 'Создание...' : 'Создать пространство пары'}
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full text-gray-600 py-2 hover:text-gray-800"
            >
              Пропустить
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <p className="text-gray-600 text-center">
              Пригласите вашего партнёра по email
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email партнёра
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="partner@example.com"
              />
            </div>
            <button
              onClick={sendInvite}
              disabled={loading || !inviteEmail}
              className="w-full bg-secondary text-white py-3 rounded-lg hover:bg-secondary/90 transition disabled:opacity-50"
            >
              {loading ? 'Отправка...' : 'Отправить приглашение'}
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full text-gray-600 py-2 hover:text-gray-800"
            >
              Пригласить позже
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-6xl mb-4">✅</div>
              <p className="text-gray-600 mb-4">
                Приглашение отправлено!
              </p>
              <div className="bg-gray-50 p-4 rounded-lg text-sm break-all">
                {inviteUrl}
              </div>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition"
            >
              Перейти к планеру
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
