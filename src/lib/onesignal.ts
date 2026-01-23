// OneSignal configuration
export const ONESIGNAL_APP_ID = 'cb22405e-14fd-45fb-82b3-f68180e0fbe6';

declare global {
  interface Window {
    OneSignalDeferred?: any[];
    OneSignal?: any;
  }
}

export async function initOneSignal() {
  if (typeof window === 'undefined') return;
  
  console.log('🔄 Initializing OneSignal...');
  
  try {
    // Wait for OneSignal SDK to load
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    
    window.OneSignalDeferred.push(async function(OneSignal: any) {
      console.log('📦 OneSignal SDK loaded');
      
      await OneSignal.init({
        appId: ONESIGNAL_APP_ID,
        allowLocalhostAsSecureOrigin: true,
        notifyButton: {
          enable: false,
        },
      });
      
      console.log('✅ OneSignal initialized successfully');
    });
  } catch (error) {
    console.error('❌ OneSignal initialization error:', error);
  }
}

export async function subscribeToOneSignal(): Promise<string | null> {
  try {
    console.log('🔔 Starting OneSignal subscription...');
    
    // Wait for OneSignal to be ready
    if (!window.OneSignal) {
      console.log('⏳ Waiting for OneSignal SDK...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    const OneSignal = window.OneSignal;
    if (!OneSignal) {
      throw new Error('OneSignal SDK not loaded');
    }
    
    console.log('📱 Requesting notification permission...');
    
    // Request permission using Notifications API
    const permission = await OneSignal.Notifications.requestPermission();
    console.log('Permission result:', permission);
    
    if (!permission) {
      throw new Error('Permission denied');
    }
    
    // Get OneSignal User ID
    const userId = OneSignal.User.PushSubscription.id;
    console.log('✅ OneSignal User ID:', userId);
    
    if (!userId) {
      throw new Error('Failed to get OneSignal User ID');
    }
    
    return userId;
  } catch (error) {
    console.error('❌ OneSignal subscription error:', error);
    throw error;
  }
}

export async function getOneSignalUserId(): Promise<string | null> {
  try {
    if (!window.OneSignal) return null;
    return window.OneSignal.User.PushSubscription.id || null;
  } catch (error) {
    console.error('Error getting OneSignal User ID:', error);
    return null;
  }
}
