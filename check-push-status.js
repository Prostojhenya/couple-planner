const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkStatus() {
  try {
    console.log('🔍 Проверка статуса push-уведомлений...\n');

    // Найти всех пользователей
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        pushSubscription: true,
      }
    });

    console.log('👥 Пользователи:');
    for (const user of users) {
      console.log(`\n   📧 ${user.email}`);
      console.log(`   👤 ${user.name || 'Без имени'}`);
      console.log(`   🔔 Push subscription: ${user.pushSubscription ? '✅ Есть' : '❌ Нет'}`);
      
      // Найти пару
      const membership = await prisma.coupleMembers.findFirst({
        where: { userId: user.id },
        include: {
          couple: {
            include: {
              members: {
                include: {
                  user: {
                    select: {
                      email: true,
                      name: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (membership) {
        console.log(`   💑 В паре: ${membership.coupleId}`);
        console.log(`   👥 Партнёры:`);
        membership.couple.members.forEach(m => {
          if (m.userId !== user.id) {
            console.log(`      - ${m.user.name || m.user.email}`);
          }
        });
      } else {
        console.log(`   ⚠️  Не в паре`);
      }
    }

    console.log('\n✅ Проверка завершена!');

  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStatus();
