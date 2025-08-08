const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addIsTricityColumn() {
  try {
    console.log('🚀 Starting migration: Adding isTricity column to User table...');
    
    // Check if the column already exists
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'User' AND column_name = 'isTricity'
    `;
    
    if (tableInfo.length > 0) {
      console.log('✅ isTricity column already exists in User table');
      return;
    }
    
    // Add the isTricity column with default value false
    await prisma.$executeRaw`
      ALTER TABLE "User" 
      ADD COLUMN "isTricity" BOOLEAN DEFAULT false
    `;
    
    console.log('✅ Successfully added isTricity column to User table');
    
    // Verify the column was added
    const userCount = await prisma.user.count();
    console.log(`📊 Total users in database: ${userCount}`);
    
    // Show sample of updated records using raw query since Prisma client needs to be regenerated
    const sampleUsers = await prisma.$queryRaw`
      SELECT id, name, email, "isTricity" 
      FROM "User" 
      LIMIT 3
    `;
    
    console.log('📋 Sample users with new isTricity field:');
    console.table(sampleUsers);
    
    console.log('🎉 Migration completed successfully!');
    console.log('💡 All existing users have isTricity set to false by default');
    console.log('💡 Now run: npx prisma generate');
    console.log('💡 This will update the Prisma client to recognize the new field');
    console.log('💡 Frontend can then update this field to true for users in Zirakpur, Chandigarh, or Panchkula');
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
if (require.main === module) {
  addIsTricityColumn()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { addIsTricityColumn };
