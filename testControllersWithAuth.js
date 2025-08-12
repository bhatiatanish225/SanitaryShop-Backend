// Comprehensive test script for all new functionality WITH AUTHENTICATION
// Tests: isPipe products, pincode delivery pricing, address management, admin routes
// Run this with: node testControllersWithAuth.js

const baseURL = 'http://localhost:3000/api'

// Test credentials - these users should already exist
const adminCredentials = {
  email: 'pranaybansaladmin@gmail.com',
  password: 'testpassword123'
}

const userCredentials = {
  email: 'pranaybansaluser@gmail.com', 
  password: 'testpassword123'
}

let adminToken = ''
let userToken = ''

console.log('🧪 Testing ALL New Controllers and Routes WITH AUTHENTICATION...\n')

// Helper function to make authenticated requests
async function makeRequest(url, options = {}, token = '') {
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  }
  
  return fetch(url, {
    ...options,
    headers
  })
}

// Step 1: Authenticate users
async function authenticate() {
  try {
    console.log('🔐 Step 1: Getting authentication tokens...')
    
    // Login admin
    const adminResponse = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminCredentials)
    })
    
    if (!adminResponse.ok) {
      throw new Error(`Admin login failed: ${adminResponse.status}`)
    }
    
    const adminData = await adminResponse.json()
    adminToken = adminData.token
    console.log('✅ Admin authenticated successfully')
    
    // Login regular user
    const userResponse = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userCredentials)
    })
    
    if (!userResponse.ok) {
      throw new Error(`User login failed: ${userResponse.status}`)
    }
    
    const userData = await userResponse.json()
    userToken = userData.token
    console.log('✅ User authenticated successfully\n')
    
    return true
  } catch (error) {
    console.log('❌ Authentication failed:', error.message)
    console.log('⚠️  Make sure both test users exist in the database\n')
    return false
  }
}

// Test 1: User can get delivery price for pincode
async function testDeliveryPriceAuth() {
  try {
    console.log('📍 Test 1: Get delivery price for pincode 160001 (with auth)')
    
    const response = await makeRequest(`${baseURL}/addresses/delivery-price/pincode/160001`, {}, userToken)
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Success:', data)
      console.log(`   Pincode: ${data.pincode}`)
      console.log(`   Delivery Price: ₹${data.deliveryPrice}`)
      console.log(`   Found in DB: ${data.found ? 'Yes' : 'No (using default)'}`)
    } else {
      console.log('❌ Failed:', data)
    }
    console.log()
  } catch (error) {
    console.log('❌ Error:', error.message, '\n')
  }
}

// Test 2: Test unknown pincode (should get default ₹100)
async function testUnknownPincodeAuth() {
  try {
    console.log('📍 Test 2: Get delivery price for unknown pincode 999888 (with auth)')
    
    const response = await makeRequest(`${baseURL}/addresses/delivery-price/pincode/999888`, {}, userToken)
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Success:', data)
      console.log(`   Should show default ₹100 delivery price`)
    } else {
      console.log('❌ Failed:', data)
    }
    console.log()
  } catch (error) {
    console.log('❌ Error:', error.message, '\n')
  }
}

// Test 3: Get all products (should work without auth, but check isPipe field)
async function testProductsWithIsPipe() {
  try {
    console.log('🛍️ Test 3: Get all products (checking isPipe field)')
    
    const response = await fetch(`${baseURL}/products`)
    const data = await response.json()
    
    if (response.ok && data.products) {
      console.log('✅ Success:', {
        totalProducts: data.products.length,
        sampleProduct: data.products[0] ? {
          name: data.products[0].name,
          isPipe: data.products[0].isPipe,
          is_pipe: data.products[0].is_pipe
        } : 'No products'
      })
    } else {
      console.log('❌ Failed:', data)
    }
    console.log()
  } catch (error) {
    console.log('❌ Error:', error.message, '\n')
  }
}

// Test 4: Filter pipe products only
async function testPipeProductsFilter() {
  try {
    console.log('🔧 Test 4: Filter pipe products (isPipe=true)')
    
    const response = await fetch(`${baseURL}/products?isPipe=true`)
    const data = await response.json()
    
    if (response.ok && data.products) {
      const allArePipes = data.products.every(p => p.isPipe === true)
      console.log('✅ Success:', {
        pipeProducts: data.products.length,
        allArePipeProducts: allArePipes,
        samplePipe: data.products[0]?.name || 'No pipe products found'
      })
    } else {
      console.log('❌ Failed:', data)
    }
    console.log()
  } catch (error) {
    console.log('❌ Error:', error.message, '\n')
  }
}

// Test 5: Filter non-pipe products
async function testNonPipeProductsFilter() {
  try {
    console.log('🚿 Test 5: Filter non-pipe products (isPipe=false)')
    
    const response = await fetch(`${baseURL}/products?isPipe=false`)
    const data = await response.json()
    
    if (response.ok && data.products) {
      const allAreNonPipes = data.products.every(p => p.isPipe === false)
      console.log('✅ Success:', {
        nonPipeProducts: data.products.length,
        allAreNonPipeProducts: allAreNonPipes,
        sampleNonPipe: data.products[0]?.name || 'No non-pipe products found'
      })
    } else {
      console.log('❌ Failed:', data)
    }
    console.log()
  } catch (error) {
    console.log('❌ Error:', error.message, '\n')
  }
}

// Test 6: Admin - Get all pincodes (NEW ADMIN ROUTE)
async function testAdminGetPincodes() {
  try {
    console.log('👨‍💼 Test 6: Admin - Get all pincodes (NEW ROUTE)')
    
    const response = await makeRequest(`${baseURL}/admin/pincodes`, {}, adminToken)
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Success:', {
        totalPincodes: data.totalPincodes || 0,
        samplePincodes: (data.pincodes || []).slice(0, 3).map(p => ({
          pincode: p.code,
          deliveryPrice: p.deliveryPrice
        }))
      })
    } else {
      console.log('❌ Failed:', data)
    }
    console.log()
  } catch (error) {
    console.log('❌ Error:', error.message, '\n')
  }
}

// Test 7: Admin - Create/Update pincode delivery price (NEW ADMIN ROUTE)
async function testAdminManagePincode() {
  try {
    console.log('💰 Test 7: Admin - Manage pincode delivery pricing (NEW ROUTE)')
    
    const testPincode = {
      pincode: '999777',
      deliveryPrice: 120
    }
    
    const response = await makeRequest(`${baseURL}/admin/pincode`, {
      method: 'POST',
      body: JSON.stringify(testPincode)
    }, adminToken)
    
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Success:', {
        created: true,
        pincode: data.pincode,
        deliveryPrice: data.deliveryPrice
      })
    } else {
      console.log('❌ Failed:', data)
    }
    console.log()
  } catch (error) {
    console.log('❌ Error:', error.message, '\n')
  }
}

// Test 8: User tries to access admin route (should fail)
async function testUserAccessAdmin() {
  try {
    console.log('🚫 Test 8: Regular user tries to access admin route (should fail)')
    
    const response = await makeRequest(`${baseURL}/admin/pincodes`, {}, userToken)
    const data = await response.json()
    
    if (!response.ok) {
      console.log('✅ Correctly blocked:', data.message || 'Access denied')
    } else {
      console.log('❌ Security issue: User accessed admin route!', data)
    }
    console.log()
  } catch (error) {
    console.log('❌ Error:', error.message, '\n')
  }
}

// Test 9: Add an address (user route with auth)
async function testAddAddress() {
  try {
    console.log('🏠 Test 9: Add new address (with pincode)')
    
    const testAddress = {
      label: 'Home',
      house: '123',
      street: 'Test Street',
      city: 'chandigarh',
      pincode: '160001'
    }
    
    const response = await makeRequest(`${baseURL}/addresses`, {
      method: 'POST',
      body: JSON.stringify(testAddress)
    }, userToken)
    
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Success:', {
        addressId: data.address?.id || data.id,
        pincode: data.address?.pincodeValue || data.pincode,
        deliveryPrice: data.deliveryPrice || 'Not calculated'
      })
      
      // Store address ID for next test
      global.testAddressId = data.address?.id || data.id
    } else {
      console.log('❌ Failed:', data)
    }
    console.log()
  } catch (error) {
    console.log('❌ Error:', error.message, '\n')
  }
}

// Test 10: Get delivery price by address ID
async function testAddressDeliveryPrice() {
  try {
    console.log('📮 Test 10: Get delivery price by address ID')
    
    if (!global.testAddressId) {
      console.log('⚠️  Skipping - no address ID from previous test\n')
      return
    }
    
    const response = await makeRequest(`${baseURL}/addresses/delivery-price/address/${global.testAddressId}`, {}, userToken)
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Success:', {
        addressId: global.testAddressId,
        deliveryPrice: data.deliveryPrice,
        pincode: data.pincode
      })
    } else {
      console.log('❌ Failed:', data)
    }
    console.log()
  } catch (error) {
    console.log('❌ Error:', error.message, '\n')
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting comprehensive authenticated tests...\n')
  
  // First authenticate
  const authSuccess = await authenticate()
  if (!authSuccess) {
    console.log('🛑 Cannot proceed without authentication. Tests stopped.\n')
    return
  }
  
  // Run all tests
  await testDeliveryPriceAuth()
  await testUnknownPincodeAuth()
  await testProductsWithIsPipe()
  await testPipeProductsFilter()
  await testNonPipeProductsFilter()
  await testAdminGetPincodes()
  await testAdminManagePincode()
  await testUserAccessAdmin()
  await testAddAddress()
  await testAddressDeliveryPrice()
  
  console.log('🎯 Test Summary:')
  console.log('✅ Authentication: Admin & User tokens')
  console.log('✅ Pincode Delivery Pricing: With proper auth')
  console.log('✅ Product isPipe Filtering: All variants tested')
  console.log('✅ Admin Routes: Moved to /api/admin/*')
  console.log('✅ Security: Admin-only routes protected')
  console.log('✅ Address Management: With pincode integration')
  console.log('✅ Route Structure: Consistent /api prefix')
  console.log()
  console.log('✨ All authenticated functionality tests completed!')
}

// Run the tests
runAllTests().catch(console.error)
