'use client';

import { useEffect, useState } from 'react';

export default function PushNotificationSetup() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isHTTPS, setIsHTTPS] = useState(false);

  useEffect(() => {
    // Проверяем поддержку уведомлений
    if ('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }

    // Проверяем iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Проверяем, установлено ли как PWA
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Проверяем HTTPS
    setIsHTTPS(window.location.protocol === 'https:' || window.location.hostname === 'localhost');
  }, []);

  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission === 'granted') {
        await subscribeToPush();
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const subscribeToPush = async () => {
    try {
      console.log('🔔 Starting push subscription...');
      
      // Регистрируем service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service worker registered');
      
      await navigator.serviceWorker.ready;
      console.log('✅ Service worker ready');

      // Получаем VAPID ключ
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.error('❌ VAPID public key not found');
        return;
      }
      console.log('✅ VAPID key found');

      // Подписываемся на push-уведомления
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
      console.log('✅ Push subscription created:', subscription.endpoint.substring(0, 50) + '...');

      // Отправляем подписку на сервер
      const token = localStorage.getItem('token');
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(subscription),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Failed to save subscription:', error);
        return;
      }

      console.log('✅ Push subscription saved to server');
      alert('✅ Уведомления успешно включены!');
    } catch (error) {
      console.error('❌ Error subscribing to push:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert('❌ Ошибка при включении уведомлений: ' + errorMessage);
    }
  };

  if (!isSupported) {
    return null;
  }

  // Предупреждение для iOS без PWA
  if (isIOS && !isStandalone) {
    return (
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm">
        <div className="flex items-start gap-3">
          <span className="text-2xl">📱</span>
          <div className="flex-1">
            <p className="font-semibold text-amber-900 mb-1">Установите приложение для уведомлений</p>
            <p className="text-xs text-amber-700 mb-2">
              На iOS push-уведомления работают только в установленных PWA приложениях.
            </p>
            <ol className="text-xs text-amber-700 space-y-1 list-decimal list-inside">
              <li>Нажмите кнопку "Поделиться" в Safari</li>
              <li>Выберите "На экран «Домой»"</li>
              <li>Запустите приложение через иконку</li>
              <li>Разрешите уведомления</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  // Предупреждение для iOS без HTTPS
  if (isIOS && !isHTTPS) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🔒</span>
          <div className="flex-1">
            <p className="font-semibold text-red-900 mb-1">Требуется HTTPS</p>
            <p className="text-xs text-red-700">
              На iOS push-уведомления работают только через HTTPS соединение.
              Используйте ngrok или deploy на хостинг с HTTPS.
            </p>
          </div>
        </div>
      </div>
    );
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
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm font-semibold"
          >
            Включить уведомления
          </button>
        </div>
      </div>
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
