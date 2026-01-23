'use client';

import { useEffect, useState } from 'react';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BK59eg1svDbWdiG3MQKE9C4hlR3UyG6AWjoxpnkAFcnMI_PIJcs3J_86duNeDRFo9CVu3zaFHh5pyAlzhI6Mi9c';

export default function PushNotificationSetup() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if ('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const requestPermission = async () => {
    console.log('🔔 Requesting notification permission...');
    setIsLoading(true);
    
    try {
      const permission = await Notification.requestPermission();
      console.log('Permission result:', permission);
      
      if (permission !== 'granted') {
        console.log('❌ Permission denied');
        alert('❌ Разрешение на уведомления отклонено');
        setPermission(permission);
        setIsLoading(false);
        return;
      }

      setPermission('granted');

      // Регистрируем Service Worker
      console.log('📝 Registering service worker...');
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service worker registered');

      // Ждём, пока Service Worker активируется
      await navigator.serviceWorker.ready;
      console.log('✅ Service worker ready');

      // Подписываемся на push-уведомления
      console.log('📱 Subscribing to push notifications...');
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      console.log('✅ Push subscription created:', subscription.endpoint);

      // Отправляем подписку на сервер
      const token = localStorage.getItem('token');
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(subscription.toJSON()),
      });

      if (response.ok) {
        console.log('✅ Subscription saved to server');
        alert('✅ Уведомления успешно включены!');
      } else {
        console.error('❌ Failed to save subscription');
        alert('❌ Ошибка при сохранении подписки');
      }
    } catch (error) {
      console.error('❌ Error setting up push notifications:', error);
      alert('❌ Ошибка при настройке уведомлений');
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
