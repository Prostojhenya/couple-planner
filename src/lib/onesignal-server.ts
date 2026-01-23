// OneSignal Server-side API
const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID || 'cb22405e-14fd-45fb-82b3-f68180e0fbe6';
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY || '';

export async function sendOneSignalNotification(
  userIds: string[],
  notification: {
    title: string;
    body: string;
    url?: string;
  }
) {
  if (!ONESIGNAL_REST_API_KEY) {
    console.warn('⚠️ OneSignal REST API Key not configured');
    return false;
  }

  try {
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        include_external_user_ids: userIds,
        headings: { en: notification.title },
        contents: { en: notification.body },
        url: notification.url || '/',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ OneSignal API error:', error);
      return false;
    }

    const result = await response.json();
    console.log('✅ OneSignal notification sent:', result);
    return true;
  } catch (error) {
    console.error('❌ Error sending OneSignal notification:', error);
    return false;
  }
}
