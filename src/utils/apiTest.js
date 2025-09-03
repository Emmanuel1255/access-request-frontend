import api, { checkApiHealth } from '../services/api';

export const runApiTests = async () => {
    console.log('🧪 Starting API Connection Tests...');
    const results = [];
    
    try {
      // Test 1: Health Check
      console.log('1️⃣ Testing health endpoint...');
      const healthResult = await checkApiHealth();
      
      if (healthResult.success) {
        console.log('✅ Health check passed:', healthResult.data);
        results.push({ test: 'Health Check', status: 'PASS', data: healthResult.data });
      } else {
        console.error('❌ Health check failed:', healthResult.error);
        results.push({ test: 'Health Check', status: 'FAIL', error: healthResult.error });
        return results; // Stop if health check fails
      }
      
      // Test 2: API Root Endpoint
      console.log('2️⃣ Testing API root endpoint...');
      try {
        const rootResponse = await api.get('/');
        console.log('✅ API root endpoint accessible:', rootResponse.data);
        results.push({ test: 'API Root', status: 'PASS', data: rootResponse.data });
      } catch (error) {
        console.error('❌ API root endpoint failed:', error.message);
        results.push({ test: 'API Root', status: 'FAIL', error: error.message });
      }
      
      // Test 3: Protected Endpoint (should fail without auth)
      console.log('3️⃣ Testing protected endpoint (should fail)...');
      try {
        await api.get('/users/profile');
        console.log('⚠️ Protected endpoint accessible without auth (unexpected)');
        results.push({ test: 'Protected Endpoint', status: 'UNEXPECTED', note: 'Should require auth' });
      } catch (error) {
        if (error.response?.status === 401) {
          console.log('✅ Protected endpoint properly secured');
          results.push({ test: 'Protected Endpoint', status: 'PASS', note: 'Properly requires authentication' });
        } else {
          console.error('❌ Protected endpoint error:', error.message);
          results.push({ test: 'Protected Endpoint', status: 'FAIL', error: error.message });
        }
      }
      
      console.log('🎉 API tests completed!');
      return results;
      
    } catch (error) {
      console.error('💥 API tests failed:', error);
      results.push({ test: 'General', status: 'FAIL', error: error.message });
      return results;
    }
  };
  
  /**
   * Quick connection test for development
   */
  export const quickConnectionTest = async () => {
    try {
      const result = await checkApiHealth();
      if (result.success) {
        console.log('🟢 Backend connection: OK');
        return true;
      } else {
        console.log('🔴 Backend connection: FAILED');
        return false;
      }
    } catch {
      console.log('🔴 Backend connection: FAILED');
      return false;
    }
  };
  
  /**
   * Development helper to run tests from browser console
   */
  if (import.meta.env.DEV) {
    window.testApi = runApiTests;
    window.testConnection = quickConnectionTest;
  }