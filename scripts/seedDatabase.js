const {
  insertData,
  clearData,
  checkDataExists,
} = require('../src/data/insert.js')

/**
 * Database seeding script
 * Usage: node scripts/seedDatabase.js [--clear] [--check]
 */

async function main() {
  const args = process.argv.slice(2)
  const shouldClear = args.includes('--clear')
  const shouldCheck = args.includes('--check')

  try {
    if (shouldCheck) {
      console.log('Checking existing data...')
      const exists = await checkDataExists()
      if (exists) {
        console.log('Data already exists in the database')
      } else {
        console.log('No existing data found')
      }
      return
    }

    if (shouldClear) {
      console.log('Clearing existing data...')
      await clearData()
    }

    console.log('Starting database seeding...')
    await insertData()
    console.log('Database seeding completed successfully!')
  } catch (error) {
    console.error('Error during database seeding:', error)
    process.exit(1)
  }
}

// Run the script
main()
