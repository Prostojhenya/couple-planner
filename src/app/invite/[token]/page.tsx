'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function InvitePage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  
  const [invite, setInvite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    loadInvite();
  }, [token]);

  const loadInvite = async () => {
    try {
      const res = await fetch(`/api/invite/${token}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Ошибка загрузки приглашения');
        return;
      }

      setInvite(data);
    } catch (err) {
      setError('Ошибка соединения');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    const authToken = localStorage.getItem('token');
    if (!authToken) {
      router.push(`/auth/login?redirect=/invite/${token}`);
      return;
    }

    setAccepting(true);
    setError('');

    try {
      const res = await fetch(`/api/invite/${token}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Ошибка принятия приглашения');
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      setError('Ошибка соединения');
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Загрузка...</div>
      </div>
    );
  }

  if (error && !invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Ошибка
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            На главную
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">💑</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Приглашение в пару
          </h1>
          <p className="text-gray-600">
            {invite?.createdBy.name || invite?.createdBy.email} приглашает вас
            в совместный планер
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleAccept}
            disabled={accepting}
            className="w-full px-6 py-3 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition disabled:opacity-50"
          >
            {accepting ? 'Принятие...' : 'Принять приглашение'}
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Отклонить
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-6">
          Приглашение действительно до{' '}
          {new Date(invite?.expiresAt).toLocaleDateString('ru-RU')}
        </p>
      </div>
    </div>
  );
}
