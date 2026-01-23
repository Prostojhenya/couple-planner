import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
  universe_domain: "googleapis.com"
};

if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount as any)
  });
}

export async function sendFCMNotification(fcmToken: string, notification: {
  title: string;
  body: string;
  icon?: string;
  data?: Record<string, string>;
}) {
  try {
    const messaging = getMessaging();
    
    const message = {
      token: fcmToken,
      notification: {
        title: notification.title,
        body: notification.body,
        ...(notification.icon && { imageUrl: notification.icon })
      },
      data: notification.data || {},
      webpush: {
        fcmOptions: {
          link: notification.data?.url || '/'
        }
      }
    };

    const response = await messaging.send(message);
    console.log('✅ FCM notification sent:', response);
    return true;
  } catch (error) {
    console.error('❌ Error sending FCM notification:', error);
    return false;
  }
}
