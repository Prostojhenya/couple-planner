import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyAhsB6m0mEXGeyU44kwqIyJK1h-zKBe738",
  authDomain: "tasktango-uuyq4.firebaseapp.com",
  projectId: "tasktango-uuyq4",
  storageBucket: "tasktango-uuyq4.firebasestorage.app",
  messagingSenderId: "875453391210",
  appId: "1:875453391210:web:a8dc7df64d21d4c46a8513"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export { app };

export async function requestNotificationPermission() {
  try {
    const supported = await isSupported();
    if (!supported) {
      console.log('Firebase Messaging is not supported in this browser');
      return null;
    }

    const messaging = getMessaging(app);
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: 'BI6VJrDsanI4tc6IQ2S71mzeuhBtMNMTchfncwAaoK923WHsE0zEMOWEpxW-298r6qOpIVjbvNBiPZeHYQ4ir9o'
      });
      
      console.log('FCM Token:', token);
      return token;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

export async function onMessageListener() {
  try {
    const supported = await isSupported();
    if (!supported) return;
    
    const messaging = getMessaging(app);
    return new Promise((resolve) => {
      onMessage(messaging, (payload) => {
        console.log('Message received:', payload);
        resolve(payload);
      });
    });
  } catch (error) {
    console.error('Error setting up message listener:', error);
  }
}
