// Test OneSignal notification sending
require('dotenv').config({ path: '.env.local' });

const ONESIGNAL_APP_ID = 'cb22405e-14fd-45fb-82b3-f68180e0fbe6';
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

async function testOneSignalNotification() {
  console.log('🧪 Testing OneSignal notification...\n');
  
  if (!ONESIGNAL_REST_API_KEY) {
    console.error('❌ ONESIGNAL_REST_API_KEY not found in .env.local');
    return;
  }
  
  console.log('📋 OneSignal App ID:', ONESIGNAL_APP_ID);
  console.log('🔑 API Key:', ONESIGNAL_REST_API_KEY.substring(0, 20) + '...\n');
  
  // Test notification to all subscribed users
  const notification = {
    app_id: ONESIGNAL_APP_ID,
    included_segments: ['Subscribed Users'],
    headings: { en: 'Test Notification' },
    contents: { en: 'This is a test notification from OneSignal!' },
    url: 'https://couple-planner-ten.vercel.app/tasks',
  };
  
  try {
    console.log('📤 Sending notification...');
    
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify(notification),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Notification sent successfully!');
      console.log('📊 Response:', JSON.stringify(data, null, 2));
      console.log('\n📱 Recipients:', data.recipients || 0);
    } else {
      console.error('❌ Failed to send notification');
      console.error('Status:', response.status);
      console.error('Error:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run test
testOneSignalNotification();
