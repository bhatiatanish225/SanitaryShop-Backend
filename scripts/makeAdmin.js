const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function promoteToAdmin() {
  try {
    const updatedUser = await prisma.user.update({
      where: { email: 'your@email.com' }, // Replace this
      data: { role: 'admin' },
    });
    console.log('✅ User promoted to admin:', updatedUser);
  } catch (err) {
    console.error('❌ Failed:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

promoteToAdmin();
