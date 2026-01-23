// OneSignal configuration
export const ONESIGNAL_APP_ID = 'cb22405e-14fd-45fb-82b3-f68180e0fbe6';

export async function initOneSignal() {
  if (typeof window === 'undefined') return;
  
  try {
    // @ts-ignore
    await window.OneSignalDeferred?.push(async function(OneSignal: any) {
      await OneSignal.init({
        appId: ONESIGNAL_APP_ID,
        safari_web_id: 'web.onesignal.auto.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        notifyButton: {
          enable: false,
        },
        allowLocalhostAsSecureOrigin: true,
      });
    });
    
    console.log('✅ OneSignal initialized');
  } catch (error) {
    console.error('❌ OneSignal initialization error:', error);
  }
}

export async function subscribeToOneSignal() {
  try {
    // @ts-ignore
    const OneSignal = window.OneSignal;
    if (!OneSignal) {
      throw new Error('OneSignal not loaded');
    }
    
    // Request permission
    await OneSignal.Slidedown.promptPush();
    
    // Get subscription ID
    const userId = await OneSignal.User.PushSubscription.id;
    console.log('✅ OneSignal User ID:', userId);
    
    return userId;
  } catch (error) {
    console.error('❌ OneSignal subscription error:', error);
    throw error;
  }
}

export async function sendOneSignalNotification(userIds: string[], notification: {
  title: string;
  body: string;
  url?: string;
}) {
  // This will be called from server-side
  // OneSignal REST API will be used
  return { userIds, notification };
}
