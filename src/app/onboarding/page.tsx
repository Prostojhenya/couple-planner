'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GroupClusterIcon from '@/components/GroupClusterIcon';

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
      console.log('Creating group with token:', token ? 'exists' : 'missing');
      
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
        setError(data.error || 'Ошибка создания группы');
        setLoading(false);
        return;
      }

      alert('Группа успешно создана!');
      setStep(2);
    } catch (err) {
      console.error('Error creating group:', err);
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
        <div className="flex justify-center mb-6">
          <GroupClusterIcon memberCount={1} maxMembers={5} subscription="free" size="lg" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Настройка группы
        </h1>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-xl border-2 border-blue-100">
              <p className="text-gray-700 text-center font-medium mb-2">
                🆓 Бесплатный план
              </p>
              <p className="text-sm text-gray-600 text-center">
                До 5 участников в группе
              </p>
            </div>
            
            <p className="text-gray-600 text-center">
              Создайте пространство для совместного планирования с друзьями, семьёй или командой
            </p>
            
            <button
              onClick={() => {
                console.log('Button clicked!');
                createCouple();
              }}
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition disabled:opacity-50 font-semibold"
            >
              {loading ? 'Создание...' : '👥 Создать группу'}
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
              Пригласите участников по email (до 5 человек)
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email участника
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="friend@example.com"
              />
            </div>
            <button
              onClick={sendInvite}
              disabled={loading || !inviteEmail}
              className="w-full bg-secondary text-white py-3 rounded-lg hover:bg-secondary/90 transition disabled:opacity-50 font-semibold"
            >
              {loading ? 'Отправка...' : '📧 Отправить приглашение'}
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
              <p className="text-xs text-gray-500 mt-3">
                Вы можете пригласить ещё до 4 участников
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition font-semibold"
            >
              Перейти к планеру
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

