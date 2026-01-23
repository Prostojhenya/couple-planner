const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createCouple() {
  try {
    // Создать или найти Женю
    let zhenya = await prisma.user.findFirst({
      where: { email: 'zhenya@example.com' }
    });

    if (!zhenya) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      zhenya = await prisma.user.create({
        data: {
          email: 'zhenya@example.com',
          name: 'Женя',
          passwordHash: hashedPassword
        }
      });
      console.log('✅ Создан пользователь Женя');
    } else {
      console.log('✅ Найден пользователь Женя');
    }

    // Создать или найти Ольгу
    let olga = await prisma.user.findFirst({
      where: { email: 'olga@example.com' }
    });

    if (!olga) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      olga = await prisma.user.create({
        data: {
          email: 'olga@example.com',
          name: 'Ольга',
          passwordHash: hashedPassword
        }
      });
      console.log('✅ Создан пользователь Ольга');
    } else {
      console.log('✅ Найден пользователь Ольга');
    }

    // Проверить, есть ли уже пары
    const zhenyaMembership = await prisma.coupleMembers.findFirst({
      where: { userId: zhenya.id }
    });

    const olgaMembership = await prisma.coupleMembers.findFirst({
      where: { userId: olga.id }
    });

    if (zhenyaMembership) {
      console.log(`⚠️  Женя уже состоит в паре, удаляем старую пару...`);
      await prisma.coupleMembers.deleteMany({
        where: { coupleId: zhenyaMembership.coupleId }
      });
      await prisma.coupleSpace.delete({
        where: { id: zhenyaMembership.coupleId }
      });
      console.log('🗑️  Старая пара удалена');
    }

    if (olgaMembership && olgaMembership.coupleId !== zhenyaMembership?.coupleId) {
      console.log(`⚠️  Ольга уже состоит в паре, удаляем старую пару...`);
      await prisma.coupleMembers.deleteMany({
        where: { coupleId: olgaMembership.coupleId }
      });
      await prisma.coupleSpace.delete({
        where: { id: olgaMembership.coupleId }
      });
      console.log('🗑️  Старая пара удалена');
    }

    // Создать новую пару
    const couple = await prisma.coupleSpace.create({
      data: {
        members: {
          create: [
            { userId: zhenya.id },
            { userId: olga.id }
          ]
        }
      },
      include: {
        members: {
          include: {
            user: true
          }
        }
      }
    });

    console.log('\n💑 Пара успешно создана!');
    console.log(`   ID пары: ${couple.id}`);
    console.log(`\n👥 Участники:`);
    couple.members.forEach(m => {
      console.log(`   - ${m.user.name || m.user.email}`);
      console.log(`     Email: ${m.user.email}`);
      console.log(`     Пароль: password123`);
    });
    console.log('\n🎉 Теперь можно войти под любым из этих пользователей!');

  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createCouple();
