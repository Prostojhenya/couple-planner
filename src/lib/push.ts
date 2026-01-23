import webpush from 'web-push';
import { prisma } from './prisma';
import { sendFCMNotification } from './firebase-admin';

// Настройка VAPID ключей (для fallback)
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    vapidSubject,
    vapidPublicKey,
    vapidPrivateKey
  );
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: {
    url?: string;
    [key: string]: any;
  };
}

export async function sendPushNotification(
  userId: string,
  payload: PushNotificationPayload
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { pushSubscription: true },
    });

    if (!user?.pushSubscription) {
      console.log(`User ${userId} has no push subscription`);
      return false;
    }

    const subscription = user.pushSubscription;

    // Проверяем формат подписки - FCM токен или VAPID subscription
    if (subscription.startsWith('{')) {
      // VAPID subscription (старый формат)
      try {
        const parsedSubscription = JSON.parse(subscription);
        await webpush.sendNotification(
          parsedSubscription,
          JSON.stringify(payload)
        );
        console.log(`✅ VAPID push notification sent to user ${userId}`);
        return true;
      } catch (error: any) {
        console.error('Error sending VAPID push notification:', error);
        
        // Если подписка истекла или невалидна - удаляем её
        if (error.statusCode === 410 || error.statusCode === 404 || error.statusCode === 403) {
          await prisma.user.update({
            where: { id: userId },
            data: { pushSubscription: null },
          });
          console.log(`Removed invalid push subscription for user ${userId}`);
        }
        return false;
      }
    } else {
      // FCM токен (новый формат)
      const success = await sendFCMNotification(subscription, {
        title: payload.title,
        body: payload.body,
        icon: payload.icon,
        data: payload.data ? Object.fromEntries(
          Object.entries(payload.data).map(([k, v]) => [k, String(v)])
        ) : undefined
      });
      
      if (success) {
        console.log(`✅ FCM push notification sent to user ${userId}`);
      }
      return success;
    }
  } catch (error: any) {
    console.error('Error sending push notification:', error);
    return false;
  }
}

export async function sendPushToCouple(
  coupleId: string,
  excludeUserId: string | null,
  payload: PushNotificationPayload
) {
  try {
    const members = await prisma.coupleMembers.findMany({
      where: {
        coupleId,
        ...(excludeUserId ? { userId: { not: excludeUserId } } : {}),
      },
      select: { userId: true },
    });

    const results = await Promise.allSettled(
      members.map((member) => sendPushNotification(member.userId, payload))
    );

    const successCount = results.filter(
      (r) => r.status === 'fulfilled' && r.value
    ).length;

    console.log(`✅ Sent ${successCount}/${members.length} push notifications`);
    return successCount;
  } catch (error) {
    console.error('Error sending push to couple:', error);
    return 0;
  }
}
