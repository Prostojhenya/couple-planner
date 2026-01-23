'use client';

import { useEffect, useState } from 'react';
import { initOneSignal, subscribeToOneSignal } from '@/lib/onesignal';

export default function PushNotificationSetup() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initialize OneSignal
    initOneSignal();
    
    // Check notification support
    if ('Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    setIsLoading(true);
    try {
      const userId = await subscribeToOneSignal();
      
      if (userId) {
        setPermission('granted');
        
        // Save OneSignal User ID to our backend
        const token = localStorage.getItem('token');
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ oneSignalUserId: userId }),
        });
        
        console.log('✅ OneSignal subscription saved');
        alert('✅ Уведомления успешно включены!');
      }
    } catch (error) {
      console.error('❌ Error subscribing to OneSignal:', error);
      alert('❌ Ошибка при включении уведомлений');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return null;
  }

  if (permission === 'granted') {
    return null;
  }

  if (permission === 'denied') {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
        <p className="font-semibold mb-1">🔕 Уведомления заблокированы</p>
        <p className="text-xs">Разрешите уведомления в настройках браузера, чтобы получать оповещения о новых задачах.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-primary-50 border border-primary-200 rounded-xl">
      <div className="flex items-start gap-3">
        <span className="text-2xl">🔔</span>
        <div className="flex-1">
          <p className="font-semibold text-primary-900 mb-1">Включить уведомления?</p>
          <p className="text-xs text-primary-700 mb-3">
            Получайте оповещения, когда партнёр создаёт для вас задачу
          </p>
          <button
            onClick={requestPermission}
            disabled={isLoading}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm font-semibold disabled:opacity-50"
          >
            {isLoading ? 'Подключение...' : 'Включить уведомления'}
          </button>
        </div>
      </div>
    </div>
  );
}
