importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAhsB6m0mEXGeyU44kwqIyJK1h-zKBe738",
  authDomain: "tasktango-uuyq4.firebaseapp.com",
  projectId: "tasktango-uuyq4",
  storageBucket: "tasktango-uuyq4.firebasestorage.app",
  messagingSenderId: "875453391210",
  appId: "1:875453391210:web:a8dc7df64d21d4c46a8513"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);
  
  const notificationTitle = payload.notification?.title || 'New notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: payload.notification?.icon || '/icon-512.png',
    badge: '/icon-512.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
