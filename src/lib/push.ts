import webpush from 'web-push';
import { prisma } from './prisma';

// Настройка VAPID ключей
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

    const subscription = JSON.parse(user.pushSubscription);

    await webpush.sendNotification(
      subscription,
      JSON.stringify(payload)
    );

    console.log(`✅ Push notification sent to user ${userId}`);
    return true;
  } catch (error: any) {
    console.error('Error sending push notification:', error);

    // Если подписка истекла или невалидна - удаляем её
    if (error.statusCode === 410 || error.statusCode === 404) {
      await prisma.user.update({
        where: { id: userId },
        data: { pushSubscription: null },
      });
      console.log(`Removed invalid push subscription for user ${userId}`);
    }

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
