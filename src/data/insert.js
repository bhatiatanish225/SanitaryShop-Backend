const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const data = [
  {
    name: 'Electronics',
    description: 'Latest electronic gadgets and devices',
    imageUrl: 'https://example.com/images/electronics.jpg',
    products: [
      {
        name: 'Smartphone X',
        description: 'A high-end smartphone with amazing features',
        imageUrl: 'https://example.com/images/smartphone.jpg',
        price: 699.99,
        originalPrice: 799.99,
        isFeatured: true,
        isBestseller: true,
        availableStock: 20,
        stockQuantity: 20,
        rating: 4.5,
        reviewsCount: 120,
        taxPercent: 18.0,
      },
      {
        name: 'Wireless Earbuds',
        description: 'Noise-cancelling Bluetooth earbuds',
        imageUrl: 'https://example.com/images/earbuds.jpg',
        price: 49.99,
        originalPrice: 69.99,
        isFeatured: false,
        isBestseller: true,
        availableStock: 100,
        stockQuantity: 100,
        rating: 4.2,
        reviewsCount: 85,
        taxPercent: 12.0,
      },
      {
        name: 'Smart Watch',
        description: 'Fitness tracking smartwatch with heart monitor',
        imageUrl: 'https://example.com/images/smartwatch.jpg',
        price: 199.99,
        originalPrice: 249.99,
        isFeatured: true,
        isBestseller: false,
        availableStock: 50,
        stockQuantity: 50,
        rating: 4.6,
        reviewsCount: 90,
        taxPercent: 12.0,
      },
      {
        name: 'Gaming Laptop',
        description: 'High performance gaming laptop with RTX graphics',
        imageUrl: 'https://example.com/images/laptop.jpg',
        price: 1499.99,
        originalPrice: 1699.99,
        isFeatured: false,
        isBestseller: true,
        availableStock: 15,
        stockQuantity: 15,
        rating: 4.8,
        reviewsCount: 60,
        taxPercent: 18.0,
      },
      {
        name: 'Bluetooth Speaker',
        description: 'Portable waterproof Bluetooth speaker',
        imageUrl: 'https://example.com/images/speaker.jpg',
        price: 89.99,
        originalPrice: 99.99,
        isFeatured: true,
        isBestseller: false,
        availableStock: 40,
        stockQuantity: 40,
        rating: 4.3,
        reviewsCount: 30,
        taxPercent: 12.0,
      },
    ],
  },
  {
    name: 'Fashion',
    description: 'Trendy clothing and accessories',
    imageUrl: 'https://example.com/images/fashion.jpg',
    products: [
      {
        name: 'Denim Jacket',
        description: 'Classic blue denim jacket',
        imageUrl: 'https://example.com/images/jacket.jpg',
        price: 59.99,
        originalPrice: 79.99,
        isFeatured: true,
        isBestseller: false,
        availableStock: 35,
        stockQuantity: 35,
        rating: 4.4,
        reviewsCount: 47,
        taxPercent: 5.0,
      },
      {
        name: 'Leather Wallet',
        description: "Genuine leather men's wallet",
        imageUrl: 'https://example.com/images/wallet.jpg',
        price: 29.99,
        originalPrice: 39.99,
        isFeatured: false,
        isBestseller: true,
        availableStock: 60,
        stockQuantity: 60,
        rating: 4.1,
        reviewsCount: 55,
        taxPercent: 5.0,
      },
      {
        name: 'Sneakers',
        description: 'Comfortable and stylish sneakers',
        imageUrl: 'https://example.com/images/sneakers.jpg',
        price: 89.99,
        originalPrice: 99.99,
        isFeatured: true,
        isBestseller: true,
        availableStock: 80,
        stockQuantity: 80,
        rating: 4.7,
        reviewsCount: 150,
        taxPercent: 12.0,
      },
      {
        name: 'Wrist Watch',
        description: 'Analog wrist watch with leather strap',
        imageUrl: 'https://example.com/images/watch.jpg',
        price: 149.99,
        originalPrice: 199.99,
        isFeatured: false,
        isBestseller: true,
        availableStock: 25,
        stockQuantity: 25,
        rating: 4.5,
        reviewsCount: 32,
        taxPercent: 5.0,
      },
      {
        name: 'Sunglasses',
        description: 'UV-protected fashionable sunglasses',
        imageUrl: 'https://example.com/images/sunglasses.jpg',
        price: 39.99,
        originalPrice: 49.99,
        isFeatured: true,
        isBestseller: false,
        availableStock: 45,
        stockQuantity: 45,
        rating: 4.0,
        reviewsCount: 20,
        taxPercent: 5.0,
      },
    ],
  },
  {
    name: 'Home Appliances',
    description: 'Essentials for your home',
    imageUrl: 'https://example.com/images/appliances.jpg',
    products: [
      {
        name: 'Microwave Oven',
        description: '800W microwave oven with grill',
        imageUrl: 'https://example.com/images/microwave.jpg',
        price: 149.99,
        originalPrice: 179.99,
        isFeatured: true,
        isBestseller: false,
        availableStock: 22,
        stockQuantity: 22,
        rating: 4.3,
        reviewsCount: 44,
        taxPercent: 18.0,
      },
      {
        name: 'Vacuum Cleaner',
        description: 'Powerful vacuum with HEPA filter',
        imageUrl: 'https://example.com/images/vacuum.jpg',
        price: 129.99,
        originalPrice: 159.99,
        isFeatured: false,
        isBestseller: true,
        availableStock: 18,
        stockQuantity: 18,
        rating: 4.6,
        reviewsCount: 33,
        taxPercent: 18.0,
      },
      {
        name: 'Air Conditioner',
        description: '1.5 Ton Inverter AC',
        imageUrl: 'https://example.com/images/ac.jpg',
        price: 399.99,
        originalPrice: 449.99,
        isFeatured: true,
        isBestseller: true,
        availableStock: 10,
        stockQuantity: 10,
        rating: 4.8,
        reviewsCount: 25,
        taxPercent: 18.0,
      },
      {
        name: 'Ceiling Fan',
        description: 'Energy efficient ceiling fan',
        imageUrl: 'https://example.com/images/fan.jpg',
        price: 49.99,
        originalPrice: 59.99,
        isFeatured: false,
        isBestseller: false,
        availableStock: 30,
        stockQuantity: 30,
        rating: 4.2,
        reviewsCount: 20,
        taxPercent: 12.0,
      },
      {
        name: 'Refrigerator',
        description: 'Double door frost-free refrigerator',
        imageUrl: 'https://example.com/images/fridge.jpg',
        price: 599.99,
        originalPrice: 649.99,
        isFeatured: true,
        isBestseller: true,
        availableStock: 8,
        stockQuantity: 8,
        rating: 4.9,
        reviewsCount: 15,
        taxPercent: 18.0,
      },
    ],
  },
  {
    name: 'Books',
    description: 'Fiction, non-fiction, and educational books',
    imageUrl: 'https://example.com/images/books.jpg',
    products: [
      {
        name: 'The Great Gatsby',
        description: 'Classic novel by F. Scott Fitzgerald',
        imageUrl: 'https://example.com/images/gatsby.jpg',
        price: 9.99,
        originalPrice: 14.99,
        isFeatured: true,
        isBestseller: true,
        availableStock: 100,
        stockQuantity: 100,
        rating: 4.6,
        reviewsCount: 210,
        taxPercent: 0.0,
      },
      {
        name: 'Atomic Habits',
        description: 'Self-help book by James Clear',
        imageUrl: 'https://example.com/images/atomic.jpg',
        price: 12.99,
        originalPrice: 17.99,
        isFeatured: true,
        isBestseller: true,
        availableStock: 80,
        stockQuantity: 80,
        rating: 4.9,
        reviewsCount: 300,
        taxPercent: 0.0,
      },
      {
        name: 'Clean Code',
        description: 'Guide to writing better code',
        imageUrl: 'https://example.com/images/cleancode.jpg',
        price: 29.99,
        originalPrice: 34.99,
        isFeatured: true,
        isBestseller: false,
        availableStock: 40,
        stockQuantity: 40,
        rating: 4.8,
        reviewsCount: 90,
        taxPercent: 0.0,
      },
      {
        name: "Harry Potter and the Sorcerer's Stone",
        description: 'First book in the Harry Potter series',
        imageUrl: 'https://example.com/images/harrypotter.jpg',
        price: 7.99,
        originalPrice: 9.99,
        isFeatured: false,
        isBestseller: true,
        availableStock: 150,
        stockQuantity: 150,
        rating: 4.9,
        reviewsCount: 500,
        taxPercent: 0.0,
      },
      {
        name: 'Introduction to Algorithms',
        description: 'Textbook by Cormen et al.',
        imageUrl: 'https://example.com/images/algorithms.jpg',
        price: 59.99,
        originalPrice: 69.99,
        isFeatured: false,
        isBestseller: false,
        availableStock: 20,
        stockQuantity: 20,
        rating: 4.7,
        reviewsCount: 70,
        taxPercent: 0.0,
      },
    ],
  },
  {
    name: 'Groceries',
    description: 'Everyday food and household supplies',
    imageUrl: 'https://example.com/images/groceries.jpg',
    products: [
      {
        name: 'Basmati Rice (1kg)',
        description: 'Premium long-grain rice',
        imageUrl: 'https://example.com/images/rice.jpg',
        price: 2.99,
        originalPrice: 3.49,
        isFeatured: true,
        isBestseller: true,
        availableStock: 200,
        stockQuantity: 200,
        rating: 4.5,
        reviewsCount: 55,
        taxPercent: 0.0,
      },
      {
        name: 'Cooking Oil (1L)',
        description: 'Sunflower cooking oil',
        imageUrl: 'https://example.com/images/oil.jpg',
        price: 1.99,
        originalPrice: 2.49,
        isFeatured: false,
        isBestseller: true,
        availableStock: 180,
        stockQuantity: 180,
        rating: 4.2,
        reviewsCount: 40,
        taxPercent: 0.0,
      },
      {
        name: 'Toothpaste',
        description: 'Herbal toothpaste 150g',
        imageUrl: 'https://example.com/images/toothpaste.jpg',
        price: 0.99,
        originalPrice: 1.49,
        isFeatured: false,
        isBestseller: false,
        availableStock: 300,
        stockQuantity: 300,
        rating: 4.0,
        reviewsCount: 22,
        taxPercent: 0.0,
      },
      {
        name: 'Hand Wash',
        description: 'Liquid hand wash 500ml',
        imageUrl: 'https://example.com/images/handwash.jpg',
        price: 1.49,
        originalPrice: 1.99,
        isFeatured: true,
        isBestseller: false,
        availableStock: 150,
        stockQuantity: 150,
        rating: 4.3,
        reviewsCount: 18,
        taxPercent: 0.0,
      },
      {
        name: 'Milk (1L)',
        description: 'Full cream packaged milk',
        imageUrl: 'https://example.com/images/milk.jpg',
        price: 1.29,
        originalPrice: 1.49,
        isFeatured: false,
        isBestseller: true,
        availableStock: 250,
        stockQuantity: 250,
        rating: 4.4,
        reviewsCount: 27,
        taxPercent: 0.0,
      },
    ],
  },
]

/**
 * Function to insert categories and products data into the database
 */
async function insertData() {
  try {
    console.log('Starting data insertion...')

    // Clear existing data (optional - uncomment if you want to reset)
    // await prisma.product.deleteMany();
    // await prisma.category.deleteMany();

    for (const categoryData of data) {
      console.log(`Inserting category: ${categoryData.name}`)

      // Create category
      const category = await prisma.category.create({
        data: {
          name: categoryData.name,
          description: categoryData.description,
          imageUrl: categoryData.imageUrl,
        },
      })

      console.log(`Category created with ID: ${category.id}`)

      // Create products for this category
      for (const productData of categoryData.products) {
        console.log(`Inserting product: ${productData.name}`)

        const product = await prisma.product.create({
          data: {
            name: productData.name,
            description: productData.description,
            imageUrl: productData.imageUrl,
            price: productData.price,
            originalPrice: productData.originalPrice,
            isFeatured: productData.isFeatured,
            isBestseller: productData.isBestseller,
            availableStock: productData.availableStock,
            stockQuantity: productData.stockQuantity,
            rating: productData.rating,
            reviewsCount: productData.reviewsCount,
            taxPercent: productData.taxPercent,
            categoryId: category.id,
          },
        })

        console.log(`Product created with ID: ${product.id}`)
      }
    }

    console.log('Data insertion completed successfully!')

    // Log summary
    const categoryCount = await prisma.category.count()
    const productCount = await prisma.product.count()
    console.log(`Total categories: ${categoryCount}`)
    console.log(`Total products: ${productCount}`)
  } catch (error) {
    console.error('Error inserting data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * Function to clear all data from categories and products tables
 */
async function clearData() {
  try {
    console.log('Clearing existing data...')

    // Delete products first (due to foreign key constraint)
    await prisma.product.deleteMany()
    console.log('All products deleted')

    // Delete categories
    await prisma.category.deleteMany()
    console.log('All categories deleted')

    console.log('Data cleared successfully!')
  } catch (error) {
    console.error('Error clearing data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * Function to check if data already exists
 */
async function checkDataExists() {
  try {
    const categoryCount = await prisma.category.count()
    const productCount = await prisma.product.count()

    console.log(`Existing categories: ${categoryCount}`)
    console.log(`Existing products: ${productCount}`)

    return categoryCount > 0 || productCount > 0
  } catch (error) {
    console.error('Error checking data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Export functions for use in other files
module.exports = {
  insertData,
  clearData,
  checkDataExists,
  data,
}

// If this file is run directly, insert the data
if (require.main === module) {
  insertData()
    .then(() => {
      console.log('Script completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Script failed:', error)
      process.exit(1)
    })
}
