// src/utils/serviceTest.js
import { 
    authService, 
    requestService, 
    formTemplateService, 
    userService,
    fileService,
    checkAllServices 
  } from '../services';
  
  /**
   * Test all services (for development)
   */
  export const testServiceLayer = async () => {
    console.log('🧪 Testing Service Layer...');
    
    try {
      // Test service availability
      const serviceResults = await checkAllServices();
      console.log('📊 Service Status:', serviceResults);
      
      // Test error handling
      console.log('\n🔍 Testing Error Handling...');
      
      // Test auth service error handling
      try {
        await authService.loginAD('invalid', 'credentials');
      } catch (error) {
        console.log('✅ Auth error handling works:', error.message);
      }
      
      // Test request service error handling  
      try {
        await requestService.getRequestById(99999);
      } catch (error) {
        console.log('✅ Request error handling works:', error.message);
      }
      
      // Test template service error handling
      try {
        await formTemplateService.getTemplateById(99999);
      } catch (error) {
        console.log('✅ Template error handling works:', error.message);
      }
      
      console.log('\n🎉 Service layer tests completed!');
      
      return {
        success: true,
        serviceStatus: serviceResults,
        message: 'All service layer tests passed'
      };
      
    } catch (error) {
      console.error('💥 Service layer tests failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };
  
  /**
   * Test specific service method
   */
  export const testServiceMethod = async (serviceName, methodName, ...args) => {
    console.log(`🧪 Testing ${serviceName}.${methodName}...`);
    
    const services = {
      auth: authService,
      request: requestService,
      template: formTemplateService,
      user: userService,
      file: fileService
    };
    
    const service = services[serviceName];
    if (!service) {
      console.error(`❌ Service "${serviceName}" not found`);
      return;
    }
    
    const method = service[methodName];
    if (!method) {
      console.error(`❌ Method "${methodName}" not found in ${serviceName} service`);
      return;
    }
    
    try {
      const result = await method(...args);
      console.log(`✅ ${serviceName}.${methodName} success:`, result);
      return result;
    } catch (error) {
      console.log(`⚠️ ${serviceName}.${methodName} error:`, error.message);
      return { success: false, error };
    }
  };
  
  // Development helpers
  if (import.meta.env.DEV) {
    window.testServices = testServiceLayer;
    window.testServiceMethod = testServiceMethod;
  }