const { PrismaClient } = require("@prisma/client");
const axios = require("axios");

const prisma = new PrismaClient();

// Configuration
const BASE_URL = "http://localhost:3000";

// Test credentials
const TEST_USER = {
  name: "API Test User",
  email: "apitest@example.com",
  password: "test123456",
  phone: "9876543210",
  city: "Chandigarh",
};

const TEST_ADMIN = {
  email: "jamcocobutter@gmail.com", // Use existing admin
  password: "SURYA",
};

class ComprehensiveAPITest {
  constructor() {
    this.userToken = null;
    this.adminToken = null;
    this.testResults = [];
    this.createdResources = {
      categoryId: null,
      productId: null,
      addressId: null,
      orderId: null,
      cartItemId: null,
    };
  }

  log(message, type = "info") {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
    console.log(logMessage);
    this.testResults.push({ timestamp, type, message });
  }

  async makeRequest(method, url, data = null, headers = {}) {
    try {
      const config = {
        method,
        url: `${BASE_URL}${url}`,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return { success: true, data: response.data, status: response.status };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        status: error.response?.status || 500,
      };
    }
  }

  async testAuthenticationRoutes() {
    this.log("\n🔐 Testing Authentication Routes...");

    // Test user registration
    this.log("1. Testing POST /api/auth/register...");
    const registerResult = await this.makeRequest(
      "POST",
      "/api/auth/register",
      TEST_USER
    );

    if (registerResult.success) {
      this.log("✅ User registration successful");
      this.userToken = registerResult.data.token;
    } else {
      if (registerResult.error.includes("already exists")) {
        this.log("⚠️ User already exists, trying login...");

        // Try login instead
        const loginResult = await this.makeRequest("POST", "/api/auth/login", {
          email: TEST_USER.email,
          password: TEST_USER.password,
        });

        if (loginResult.success) {
          this.log("✅ User login successful");
          this.userToken = loginResult.data.token;
        } else {
          this.log(`❌ User login failed: ${loginResult.error}`, "error");
        }
      } else {
        this.log(
          `❌ User registration failed: ${registerResult.error}`,
          "error"
        );
      }
    }

    // Test admin login
    this.log("2. Testing admin login...");
    const adminLoginResult = await this.makeRequest("POST", "/api/auth/login", {
      email: TEST_ADMIN.email,
      password: TEST_ADMIN.password,
    });

    if (adminLoginResult.success) {
      this.log("✅ Admin login successful");
      this.adminToken = adminLoginResult.data.token;
    } else {
      this.log(`❌ Admin login failed: ${adminLoginResult.error}`, "error");
    }

    // Test GET /api/auth/me
    if (this.userToken) {
      this.log("3. Testing GET /api/auth/me...");
      const meResult = await this.makeRequest("GET", "/api/auth/me", null, {
        Authorization: `Bearer ${this.userToken}`,
      });

      if (meResult.success) {
        this.log("✅ Get current user successful");
      } else {
        this.log(`❌ Get current user failed: ${meResult.error}`, "error");
      }
    }

    // Test forgot password flow
    this.log("4. Testing forgot password flow...");
    const forgotPasswordResult = await this.makeRequest(
      "POST",
      "/api/auth/forgot-password",
      {
        email: TEST_USER.email,
      }
    );

    if (forgotPasswordResult.success) {
      this.log("✅ Forgot password request successful");
    } else {
      this.log(
        `❌ Forgot password failed: ${forgotPasswordResult.error}`,
        "error"
      );
    }

    // Test send verification code
    this.log("5. Testing POST /api/auth/send-code...");
    const sendCodeResult = await this.makeRequest(
      "POST",
      "/api/auth/send-code",
      {
        email: TEST_USER.email,
      }
    );

    if (sendCodeResult.success) {
      this.log("✅ Send verification code successful");
    } else {
      this.log(
        `❌ Send verification code failed: ${sendCodeResult.error}`,
        "error"
      );
    }

    // Test logout
    if (this.userToken) {
      this.log("6. Testing POST /api/auth/logout...");
      const logoutResult = await this.makeRequest(
        "POST",
        "/api/auth/logout",
        null,
        {
          Authorization: `Bearer ${this.userToken}`,
        }
      );

      if (logoutResult.success) {
        this.log("✅ Logout successful");
      } else {
        this.log(`❌ Logout failed: ${logoutResult.error}`, "error");
      }
    }
  }

  async testCategoryRoutes() {
    this.log("\n📁 Testing Category Routes...");

    // Test GET /api/categories (public)
    this.log("1. Testing GET /api/categories...");
    const getCategoriesResult = await this.makeRequest(
      "GET",
      "/api/categories"
    );

    if (getCategoriesResult.success) {
      this.log(
        `✅ Get categories successful (${getCategoriesResult.data.length} categories)`
      );

      // Test GET /api/categories/:id with first category
      if (getCategoriesResult.data.length > 0) {
        const firstCategoryId = getCategoriesResult.data[0].id;
        this.log(`2. Testing GET /api/categories/${firstCategoryId}...`);

        const getCategoryResult = await this.makeRequest(
          "GET",
          `/api/categories/${firstCategoryId}`
        );

        if (getCategoryResult.success) {
          this.log("✅ Get category by ID successful");
          this.log(`   Category: ${getCategoryResult.data.name}`);
          this.log(
            `   Products in category: ${
              getCategoryResult.data.products?.length || 0
            }`
          );
        } else {
          this.log(
            `❌ Get category by ID failed: ${getCategoryResult.error}`,
            "error"
          );
        }
      }
    } else {
      this.log(
        `❌ Get categories failed: ${getCategoriesResult.error}`,
        "error"
      );
    }

    // Test POST /api/categories (admin only)
    if (this.adminToken) {
      this.log("3. Testing POST /api/categories (admin)...");
      const createCategoryResult = await this.makeRequest(
        "POST",
        "/api/categories",
        {
          name: "Test Category API",
          description: "Test category created via API test",
          imageUrl: "https://example.com/test-category.jpg",
        },
        {
          Authorization: `Bearer ${this.adminToken}`,
        }
      );

      if (createCategoryResult.success) {
        this.log("✅ Create category successful");
        this.createdResources.categoryId =
          createCategoryResult.data.category.id;

        // Test PUT /api/categories/:id (admin only)
        this.log("4. Testing PUT /api/categories/:id (admin)...");
        const updateCategoryResult = await this.makeRequest(
          "PUT",
          `/api/categories/${this.createdResources.categoryId}`,
          {
            name: "Updated Test Category API",
            description: "Updated test category description",
          },
          {
            Authorization: `Bearer ${this.adminToken}`,
          }
        );

        if (updateCategoryResult.success) {
          this.log("✅ Update category successful");
        } else {
          this.log(
            `❌ Update category failed: ${updateCategoryResult.error}`,
            "error"
          );
        }
      } else {
        this.log(
          `❌ Create category failed: ${createCategoryResult.error}`,
          "error"
        );
      }
    }
  }

  async testProductRoutes() {
    this.log("\n🛍️ Testing Product Routes...");

    // Test GET /api/products (requires auth)
    if (this.userToken) {
      this.log("1. Testing GET /api/products...");
      const getProductsResult = await this.makeRequest(
        "GET",
        "/api/products?limit=10",
        null,
        {
          Authorization: `Bearer ${this.userToken}`,
        }
      );

      if (getProductsResult.success) {
        // Handle both old and new response formats
        const products =
          getProductsResult.data.products || getProductsResult.data;
        const totalCount = getProductsResult.data.pagination
          ? getProductsResult.data.pagination.totalProducts
          : products.length;

        this.log(
          `✅ Get products successful (${products.length} products shown, ${totalCount} total)`
        );

        if (getProductsResult.data.pagination) {
          this.log(
            `   Total in DB: ${getProductsResult.data.pagination.totalProducts}`
          );
          this.log(
            `   Page: ${getProductsResult.data.pagination.currentPage}/${getProductsResult.data.pagination.totalPages}`
          );
        }

        // Test with query parameters
        this.log("2. Testing GET /api/products with filters...");
        const filteredProductsResult = await this.makeRequest(
          "GET",
          "/api/products?isFeatured=true&limit=5",
          null,
          {
            Authorization: `Bearer ${this.userToken}`,
          }
        );

        if (filteredProductsResult.success) {
          const filteredProducts =
            filteredProductsResult.data.products || filteredProductsResult.data;
          this.log(
            `✅ Get filtered products successful (${filteredProducts.length} featured products)`
          );
        }

        // Test GET /api/products/:id with first product
        if (products.length > 0) {
          const firstProductId = products[0].id;
          this.log(`3. Testing GET /api/products/${firstProductId}...`);

          const getProductResult = await this.makeRequest(
            "GET",
            `/api/products/${firstProductId}`,
            null,
            {
              Authorization: `Bearer ${this.userToken}`,
            }
          );

          if (getProductResult.success) {
            this.log("✅ Get product by ID successful");
            this.log(`   Product: ${getProductResult.data.name}`);
            this.log(`   Price: ₹${getProductResult.data.price}`);
            this.log(`   Stock: ${getProductResult.data.stock_quantity}`);

            // Check for CSV fields
            const csvFields = [
              "itemCode",
              "sdp",
              "nrp",
              "mrp",
              "hsn",
              "sgst",
              "cgst",
              "igst",
              "cess",
            ];
            const presentFields = csvFields.filter(
              (field) => getProductResult.data[field] !== undefined
            );
            if (presentFields.length > 0) {
              this.log(`✅ CSV fields present: ${presentFields.join(", ")}`);
            }
          } else {
            this.log(
              `❌ Get product by ID failed: ${getProductResult.error}`,
              "error"
            );
          }
        }
      } else {
        this.log(`❌ Get products failed: ${getProductsResult.error}`, "error");
      }
    }

    // Test POST /api/products (admin only)
    if (this.adminToken && this.createdResources.categoryId) {
      this.log("4. Testing POST /api/products (admin)...");
      const createProductResult = await this.makeRequest(
        "POST",
        "/api/products",
        {
          name: "Test Product API",
          description: "Test product created via API test",
          price: 1500,
          originalPrice: 2000,
          categoryId: this.createdResources.categoryId,
          availableStock: 100,
          isFeatured: true,
          isBestseller: false,
          rating: 4.5,
          reviewsCount: 0,
          taxPercent: 18.0,
          imageUrl: "https://example.com/test-product.jpg",
        },
        {
          Authorization: `Bearer ${this.adminToken}`,
        }
      );

      if (createProductResult.success) {
        this.log("✅ Create product successful");
        this.createdResources.productId = createProductResult.data.id;

        // Test PUT /api/products/:id (admin only)
        this.log("5. Testing PUT /api/products/:id (admin)...");
        const updateProductResult = await this.makeRequest(
          "PUT",
          `/api/products/${this.createdResources.productId}`,
          {
            name: "Updated Test Product API",
            description: "Updated test product description",
            price: 1800,
          },
          {
            Authorization: `Bearer ${this.adminToken}`,
          }
        );

        if (updateProductResult.success) {
          this.log("✅ Update product successful");
        } else {
          this.log(
            `❌ Update product failed: ${updateProductResult.error}`,
            "error"
          );
        }
      } else {
        this.log(
          `❌ Create product failed: ${createProductResult.error}`,
          "error"
        );
      }
    }
  }

  async testCartRoutes() {
    this.log("\n🛒 Testing Cart Routes...");

    if (this.userToken) {
      // Get a product to add to cart - use pagination
      const getProductsResult = await this.makeRequest(
        "GET",
        "/api/products?limit=5",
        null,
        {
          Authorization: `Bearer ${this.userToken}`,
        }
      );

      if (getProductsResult.success) {
        const products =
          getProductsResult.data.products || getProductsResult.data;
        if (products.length > 0) {
          const productId = products[0].id;

          // Test POST /api/cart
          this.log("1. Testing POST /api/cart...");
          const addToCartResult = await this.makeRequest(
            "POST",
            "/api/cart",
            {
              productId: productId,
              quantity: 2,
            },
            {
              Authorization: `Bearer ${this.userToken}`,
            }
          );

          if (addToCartResult.success) {
            this.log("✅ Add to cart successful");
            this.createdResources.cartItemId = addToCartResult.data.id;
          } else {
            this.log(
              `❌ Add to cart failed: ${addToCartResult.error}`,
              "error"
            );
          }

          // Test GET /api/cart
          this.log("2. Testing GET /api/cart...");
          const getCartResult = await this.makeRequest(
            "GET",
            "/api/cart",
            null,
            {
              Authorization: `Bearer ${this.userToken}`,
            }
          );

          if (getCartResult.success) {
            this.log(
              `✅ Get cart successful (${getCartResult.data.length} items)`
            );

            // Test DELETE /api/cart/:id (remove item from cart)
            if (this.createdResources.cartItemId) {
              this.log("3. Testing DELETE /api/cart/:id...");
              const removeFromCartResult = await this.makeRequest(
                "DELETE",
                `/api/cart/${this.createdResources.cartItemId}`,
                null,
                {
                  Authorization: `Bearer ${this.userToken}`,
                }
              );

              if (removeFromCartResult.success) {
                this.log("✅ Remove from cart successful");
                this.createdResources.cartItemId = null; // Mark as removed
              } else {
                this.log(
                  `❌ Remove from cart failed: ${removeFromCartResult.error}`,
                  "error"
                );
              }
            }
          } else {
            this.log(`❌ Get cart failed: ${getCartResult.error}`, "error");
          }
        }
      }
    }
  }

  async testAddressRoutes() {
    this.log("\n🏠 Testing Address Routes...");

    if (this.userToken) {
      // Test POST /api/addresses
      this.log("1. Testing POST /api/addresses...");
      const createAddressResult = await this.makeRequest(
        "POST",
        "/api/addresses",
        {
          label: "Test Address",
          house: "123",
          street: "Test Street",
          city: "Chandigarh",
          landmark: "Near Test Park",
          address1: "Additional test address info",
        },
        {
          Authorization: `Bearer ${this.userToken}`,
        }
      );

      if (createAddressResult.success) {
        this.log("✅ Create address successful");
        this.createdResources.addressId = createAddressResult.data.id;
      } else {
        this.log(
          `❌ Create address failed: ${createAddressResult.error}`,
          "error"
        );
      }

      // Test GET /api/addresses
      this.log("2. Testing GET /api/addresses...");
      const getAddressesResult = await this.makeRequest(
        "GET",
        "/api/addresses",
        null,
        {
          Authorization: `Bearer ${this.userToken}`,
        }
      );

      if (getAddressesResult.success) {
        const addressCount = getAddressesResult.data.addresses
          ? getAddressesResult.data.addresses.length
          : 0;
        this.log(`✅ Get addresses successful (${addressCount} addresses)`);

        // Test PUT /api/addresses/:id and DELETE /api/addresses/:id
        if (this.createdResources.addressId) {
          this.log("3. Testing PUT /api/addresses/:id...");
          const updateAddressResult = await this.makeRequest(
            "PUT",
            `/api/addresses/${this.createdResources.addressId}`,
            {
              label: "Updated Test Address",
              house: "456",
              street: "Updated Test Street",
              city: "Chandigarh",
            },
            {
              Authorization: `Bearer ${this.userToken}`,
            }
          );

          if (updateAddressResult.success) {
            this.log("✅ Update address successful");
          } else {
            this.log(
              `❌ Update address failed: ${updateAddressResult.error}`,
              "error"
            );
          }

          // Test GET /api/addresses/:id
          this.log("4. Testing GET /api/addresses/:id...");
          const getAddressByIdResult = await this.makeRequest(
            "GET",
            `/api/addresses/${this.createdResources.addressId}`,
            null,
            {
              Authorization: `Bearer ${this.userToken}`,
            }
          );

          if (getAddressByIdResult.success) {
            this.log("✅ Get address by ID successful");
          } else {
            this.log(
              `❌ Get address by ID failed: ${getAddressByIdResult.error}`,
              "error"
            );
          }
        }
      } else {
        this.log(
          `❌ Get addresses failed: ${getAddressesResult.error}`,
          "error"
        );
      }
    }
  }

  async testOrderRoutes() {
    this.log("\n📋 Testing Order Routes...");

    if (this.userToken && this.createdResources.addressId) {
      // Get a product for the order - use pagination
      const getProductsResult = await this.makeRequest(
        "GET",
        "/api/products?limit=5",
        null,
        {
          Authorization: `Bearer ${this.userToken}`,
        }
      );

      if (getProductsResult.success) {
        const products =
          getProductsResult.data.products || getProductsResult.data;
        if (products.length > 0) {
          const product = products[0];

          // Test POST /api/orders
          this.log("1. Testing POST /api/orders...");
          const createOrderResult = await this.makeRequest(
            "POST",
            "/api/orders",
            {
              items: [
                {
                  productId: product.id,
                  quantity: 1,
                  price: product.price,
                },
              ],
              totalAmount: product.price,
              paymentMethod: "cod",
              addressId: this.createdResources.addressId,
            },
            {
              Authorization: `Bearer ${this.userToken}`,
            }
          );

          if (createOrderResult.success) {
            this.log("✅ Create order successful");
            this.createdResources.orderId = createOrderResult.data.id;
          } else {
            this.log(
              `❌ Create order failed: ${createOrderResult.error}`,
              "error"
            );
          }

          // Test GET /api/orders
          this.log("2. Testing GET /api/orders...");
          const getOrdersResult = await this.makeRequest(
            "GET",
            "/api/orders",
            null,
            {
              Authorization: `Bearer ${this.userToken}`,
            }
          );

          if (getOrdersResult.success) {
            this.log(
              `✅ Get orders successful (${getOrdersResult.data.length} orders)`
            );

            // Test PUT /api/orders/:id/status (admin only)
            if (this.adminToken && this.createdResources.orderId) {
              this.log("3. Testing PUT /api/orders/:id/status (admin)...");
              const updateOrderStatusResult = await this.makeRequest(
                "PUT",
                `/api/orders/${this.createdResources.orderId}/status`,
                {
                  status: "confirmed",
                },
                {
                  Authorization: `Bearer ${this.adminToken}`,
                }
              );

              if (updateOrderStatusResult.success) {
                this.log("✅ Update order status successful");
              } else {
                this.log(
                  `❌ Update order status failed: ${updateOrderStatusResult.error}`,
                  "error"
                );
              }
            }
          } else {
            this.log(`❌ Get orders failed: ${getOrdersResult.error}`, "error");
          }
        }
      }
    }
  }

  async testAdminRoutes() {
    this.log("\n👨‍💼 Testing Admin Routes...");

    if (this.adminToken) {
      // Test GET /api/admin/dashboard/stats
      this.log("1. Testing GET /api/admin/dashboard/stats...");
      const dashboardResult = await this.makeRequest(
        "GET",
        "/api/admin/dashboard/stats",
        null,
        {
          Authorization: `Bearer ${this.adminToken}`,
        }
      );

      if (dashboardResult.success) {
        this.log("✅ Admin dashboard successful");
        this.log(`   Total Users: ${dashboardResult.data.totalUsers}`);
        this.log(`   Total Orders: ${dashboardResult.data.totalOrders}`);
        this.log(`   Total Products: ${dashboardResult.data.totalProducts}`);
        this.log(`   Total Revenue: ₹${dashboardResult.data.totalRevenue}`);
      } else {
        this.log(
          `❌ Admin dashboard failed: ${dashboardResult.error}`,
          "error"
        );
      }

      // Test GET /api/admin/orders
      this.log("2. Testing GET /api/admin/orders...");
      const adminOrdersResult = await this.makeRequest(
        "GET",
        "/api/admin/orders?limit=10",
        null,
        {
          Authorization: `Bearer ${this.adminToken}`,
        }
      );

      if (adminOrdersResult.success) {
        const orders = adminOrdersResult.data.orders || adminOrdersResult.data;
        this.log(`✅ Admin get orders successful (${orders.length} orders)`);
      } else {
        this.log(
          `❌ Admin get orders failed: ${adminOrdersResult.error}`,
          "error"
        );
      }

      // Test GET /api/admin/users
      this.log("3. Testing GET /api/admin/users...");
      const adminUsersResult = await this.makeRequest(
        "GET",
        "/api/admin/users?limit=10",
        null,
        {
          Authorization: `Bearer ${this.adminToken}`,
        }
      );

      if (adminUsersResult.success) {
        const users = adminUsersResult.data.users || adminUsersResult.data;
        this.log(`✅ Admin get users successful (${users.length} users)`);
      } else {
        this.log(
          `❌ Admin get users failed: ${adminUsersResult.error}`,
          "error"
        );
      }
    }
  }

  async testDatabaseValidation() {
    this.log("\n🔍 Testing Database Validation...");

    try {
      // Check product count and CSV fields
      const totalProducts = await prisma.product.count();
      this.log(`📊 Total products in database: ${totalProducts}`);

      if (totalProducts > 60000) {
        this.log("✅ CSV import appears successful (60K+ products)");
      }

      // Check sample product with CSV fields
      const sampleProduct = await prisma.product.findFirst({
        select: {
          id: true,
          name: true,
          itemCode: true,
          sdp: true,
          nrp: true,
          mrp: true,
          hsn: true,
          sgst: true,
          cgst: true,
          igst: true,
          cess: true,
        },
      });

      if (sampleProduct) {
        const csvFields = [
          "itemCode",
          "sdp",
          "nrp",
          "mrp",
          "hsn",
          "sgst",
          "cgst",
          "igst",
          "cess",
        ];
        const fieldsWithData = csvFields.filter(
          (field) =>
            sampleProduct[field] !== null &&
            sampleProduct[field] !== undefined &&
            sampleProduct[field] !== ""
        );

        this.log(`✅ CSV fields with data: ${fieldsWithData.join(", ")}`);
      }

      // Check categories
      const totalCategories = await prisma.category.count();
      this.log(`📁 Total categories: ${totalCategories}`);
    } catch (error) {
      this.log(`❌ Database validation failed: ${error.message}`, "error");
    }
  }

  async cleanup() {
    this.log("\n🧹 Cleaning up test data...");

    try {
      // Clean up in reverse order of dependencies
      if (this.createdResources.orderId) {
        await prisma.orderItem.deleteMany({
          where: { orderId: this.createdResources.orderId },
        });
        await prisma.order.delete({
          where: { id: this.createdResources.orderId },
        });
        this.log("✅ Test order cleaned up");
      }

      if (this.createdResources.cartItemId) {
        await prisma.cartItem.delete({
          where: { id: this.createdResources.cartItemId },
        });
        this.log("✅ Test cart item cleaned up");
      }

      if (this.createdResources.productId) {
        await prisma.product.delete({
          where: { id: this.createdResources.productId },
        });
        this.log("✅ Test product cleaned up");
      }

      if (this.createdResources.categoryId) {
        await prisma.category.delete({
          where: { id: this.createdResources.categoryId },
        });
        this.log("✅ Test category cleaned up");
      }

      if (this.createdResources.addressId) {
        await prisma.address.delete({
          where: { id: this.createdResources.addressId },
        });
        this.log("✅ Test address cleaned up");
      }
    } catch (error) {
      this.log(`⚠️ Cleanup warning: ${error.message}`, "warning");
    }
  }

  async runAllTests() {
    this.log("🚀 Starting Comprehensive API Test Suite...");
    this.log(`Target URL: ${BASE_URL}`);

    try {
      await this.testDatabaseValidation();
      await this.testAuthenticationRoutes();
      await this.testCategoryRoutes();
      await this.testProductRoutes();
      await this.testCartRoutes();
      await this.testAddressRoutes();
      await this.testOrderRoutes();
      await this.testAdminRoutes();

      // Summary
      this.log("\n📋 Test Summary:");
      const errors = this.testResults.filter((r) => r.type === "error").length;
      const warnings = this.testResults.filter(
        (r) => r.type === "warning"
      ).length;
      const successes = this.testResults.filter((r) =>
        r.message.includes("✅")
      ).length;

      this.log(`✅ Successes: ${successes}`);
      this.log(`⚠️ Warnings: ${warnings}`);
      this.log(`❌ Errors: ${errors}`);

      if (errors === 0) {
        this.log("🎉 All critical tests passed!");
      } else {
        this.log("🔧 Some tests failed. Please review the errors above.");
      }
    } catch (error) {
      this.log(`❌ Test suite failed: ${error.message}`, "error");
    } finally {
      await this.cleanup();
      await prisma.$disconnect();
    }
  }
}

// Run the comprehensive test suite
async function main() {
  const testSuite = new ComprehensiveAPITest();
  await testSuite.runAllTests();
}

if (require.main === module) {
  main();
}

module.exports = ComprehensiveAPITest;
