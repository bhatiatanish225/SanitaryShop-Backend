const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000/api';
const TEST_USER = {
  email: 'admin@test.com',
  password: 'admin123'
};

let authToken = '';

// Helper function to make authenticated requests
const makeRequest = async (method, url, data = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`❌ ${method.toUpperCase()} ${url} failed:`, error.response?.data || error.message);
    throw error;
  }
};

// Test login and get auth token
const testLogin = async () => {
  try {
    console.log('🔐 Testing login...');
    const response = await axios.post(`${BASE_URL}/auth/login`, TEST_USER);
    authToken = response.data.token;
    console.log('✅ Login successful');
    console.log('📝 Auth token received:', authToken ? 'Yes' : 'No');
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    console.log('💡 Make sure you have a test user with email:', TEST_USER.email);
    return false;
  }
};

// Test Scenario 1: Set isTricity status (on login)
const testSetTricityStatus = async (isTricity) => {
  try {
    console.log(`\n📍 Testing SET isTricity to: ${isTricity}`);
    
    const response = await makeRequest('POST', '/location/istricity', { isTricity });
    
    console.log('✅ Set tricity status successful');
    console.log('📊 Response:', JSON.stringify(response, null, 2));
    
    return response.data.isTricity === isTricity;
  } catch (error) {
    return false;
  }
};

// Test Scenario 2: Get isTricity status (before payment)
const testGetTricityStatus = async () => {
  try {
    console.log('\n💳 Testing GET isTricity status (before payment)');
    
    const response = await makeRequest('GET', '/location/istricity');
    
    console.log('✅ Get tricity status successful');
    console.log('📊 Response:', JSON.stringify(response, null, 2));
    
    if (response.data.isTricity === false) {
      console.log('📞 WhatsApp Number:', response.data.whatsappNumber);
    }
    
    return true;
  } catch (error) {
    return false;
  }
};

// Main test function
const runTests = async () => {
  console.log('🚀 Starting Location API Tests\n');
  console.log('='.repeat(50));
  
  // Step 1: Login
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without authentication');
    return;
  }
  
  // Step 2: Test setting isTricity to false (user NOT in tricity)
  console.log('\n🔄 SCENARIO 1: User NOT in tricity area');
  console.log('-'.repeat(40));
  await testSetTricityStatus(false);
  await testGetTricityStatus();
  
  // Step 3: Test setting isTricity to true (user in tricity)
  console.log('\n🔄 SCENARIO 2: User IN tricity area');
  console.log('-'.repeat(40));
  await testSetTricityStatus(true);
  await testGetTricityStatus();
  
  // Step 4: Test validation (invalid input)
  console.log('\n🔄 SCENARIO 3: Invalid input validation');
  console.log('-'.repeat(40));
  try {
    await makeRequest('POST', '/location/istricity', { isTricity: 'invalid' });
  } catch (error) {
    console.log('✅ Validation working correctly - rejected invalid input');
  }
  
  console.log('\n🎉 All tests completed!');
};

// Run the tests
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
