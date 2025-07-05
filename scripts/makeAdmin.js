const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function promoteToAdmin() {
  try {
    const updatedUser = await prisma.user.update({
      where: { email: 'tbhatia0225@gmail.com' }, // Replace this
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
