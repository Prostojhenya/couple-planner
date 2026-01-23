// Используем обычный Web Push API вместо Firebase
// Firebase не поддерживается на iOS Safari, но обычный Web Push работает!

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function requestNotificationPermission() {
  try {
    console.log('🔔 Requesting notification permission...');
    
    const permission = await Notification.requestPermission();
    console.log('Permission result:', permission);
    
    if (permission !== 'granted') {
      console.log('❌ Permission denied');
      return null;
    }

    // Используем обычный Web Push API (работает на iOS!)
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      console.log('✅ Service Worker and Push Manager supported');
      
      const registration = await navigator.serviceWorker.ready;
      console.log('✅ Service Worker ready');
      
      // Отписываемся от старой подписки если есть
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log('🔄 Unsubscribing from old subscription');
        await existingSubscription.unsubscribe();
      }
      
      // Создаём новую подписку с VAPID ключом
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BK59eg1svDbWdiG3MQKE9C4hlR3UyG6AWjoxpnkAFcnMI_PIJcs3J_86duNeDRFo9CVu3zaFHh5pyAlzhI6Mi9c';
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });
      
      console.log('✅ New subscription created:', subscription.endpoint);
      
      // Возвращаем подписку как JSON строку
      return JSON.stringify(subscription);
    }
    
    console.log('❌ Service Worker or Push Manager not supported');
    return null;
  } catch (error) {
    console.error('❌ Error getting notification permission:', error);
    return null;
  }
}

export async function onMessageListener() {
  // Для обычного Web Push API сообщения обрабатываются в service worker
  console.log('Message listener not needed for Web Push API');
}
