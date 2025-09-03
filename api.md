# Phase 1: Core Setup Implementation

## Step 1: Create API Service with Axios Configuration

### Create `src/services/api.js` (Frontend)

```javascript
// src/services/api.js
import axios from 'axios';

// Get API base URL from environment or default to localhost
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for CORS with credentials
});

// Request interceptor - runs before every request
api.interceptors.request.use(
  (config) => {
    // Add auth token to requests if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - runs after every response
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      const { status, data } = error.response;
      
      // Log error in development
      if (import.meta.env.DEV) {
        console.error(`❌ API Error: ${status} - ${error.config?.url}`, data);
      }
      
      // Handle 401 - Unauthorized (token expired/invalid)
      if (status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        
        // Only redirect to login if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
      
      // Handle 403 - Forbidden
      if (status === 403) {
        console.error('Access denied - insufficient permissions');
      }
      
      // Handle 404 - Not Found
      if (status === 404) {
        console.error('Resource not found');
      }
      
      // Handle 422 - Validation Error
      if (status === 422 && data.validationErrors) {
        console.error('Validation errors:', data.validationErrors);
      }
      
      // Handle 500+ - Server Errors
      if (status >= 500) {
        console.error('Server error - please try again later');
      }
    } else if (error.request) {
      // Network error (no response received)
      console.error('❌ Network error - check your connection');
    } else {
      // Request setup error
      console.error('❌ Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Export the configured axios instance
export default api;

// Export a health check function for testing
export const checkApiHealth = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      details: error.response?.data || 'Connection failed'
    };
  }
};
```

## Step 2: Set Up Environment Variables

### Create `.env` in your frontend root

```bash
# Frontend Environment Configuration
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=Request Approval System
VITE_NODE_ENV=development

# Optional: API timeout (in milliseconds)
VITE_API_TIMEOUT=30000

# Optional: Enable API logging
VITE_ENABLE_API_LOGGING=true
```

### Create `.env.example` in your frontend root (for team sharing)

```bash
# Copy this file to .env and update the values for your environment

# Backend API Configuration
VITE_API_BASE_URL=http://localhost:5000/api

# Application Configuration
VITE_APP_NAME=Request Approval System
VITE_NODE_ENV=development

# Optional Configuration
VITE_API_TIMEOUT=30000
VITE_ENABLE_API_LOGGING=true

# Production values (examples)
# VITE_API_BASE_URL=https://your-domain.com/api
# VITE_NODE_ENV=production
```

### Add `.env` to `.gitignore` (Frontend)

```bash
# Add to your frontend .gitignore if not already present
.env
.env.local
.env.production
.env.development
```

## Step 3: Configure Vite Proxy for Development

### Update `vite.config.js`

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Development server configuration
  server: {
    port: 5555, // Frontend port (matches your backend CORS config)
    host: true, // Expose to network
    
    // Proxy configuration for API calls during development
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  },
  
  // Define global constants
  define: {
    'process.env': process.env
  },
  
  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    
    // Generate source maps for production debugging
    sourcemap: false,
    
    // Rollup options
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['framer-motion', 'lucide-react'],
        }
      }
    }
  }
})
```

## Step 4: Update Backend CORS Settings

### Update `src/app.js` (Backend)

```javascript
// src/app.js - Update the CORS configuration section
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const config = require('./config/environment');
const logger = require('./utils/logger');

const app = express();

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false // Allow embedding for development
}));

// CORS configuration - UPDATED
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5555',
      'http://127.0.0.1:5555',
      'http://localhost:3000', // Common React dev port
      'http://127.0.0.1:3000'
    ];
    
    // In development, allow all origins
    if (config.nodeEnv === 'development') {
      return callback(null, true);
    }
    
    // In production, check against allowed origins
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow credentials (cookies, authorization headers)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin', 
    'X-Requested-With', 
    'Content-Type', 
    'Accept', 
    'Authorization',
    'Cache-Control'
  ],
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

// Rest of your app.js configuration...
// (logging, body parsing, static files, routes, error handling)
```

### Update Backend Environment Configuration

Add to your backend `.env`:

```bash
# Add/update these values in your backend .env file

# Frontend Configuration
FRONTEND_URL=http://localhost:5555
FRONTEND_URLS=http://localhost:5555,http://127.0.0.1:5555

# Development Configuration
ENABLE_CORS_DEBUG=true
```

## Step 5: Create API Test Utility

### Create `src/utils/apiTest.js` (Frontend)

```javascript
// src/utils/apiTest.js
import api, { checkApiHealth } from '../services/api';

/**
 * Test API connection and basic functionality
 */
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
```

## Step 6: Update Package Scripts

### Update `package.json` (Frontend)

```json
{
  "scripts": {
    "dev": "vite --port 5555",
    "dev:host": "vite --port 5555 --host",
    "build": "vite build",
    "preview": "vite preview --port 5555",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "test:api": "node -e \"import('./src/utils/apiTest.js').then(m => m.runApiTests())\"",
    "dev:full": "echo 'Start backend server first, then run npm run dev'"
  }
}
```

## Testing Phase 1 Implementation

### 1. Start Your Backend Server
```bash
cd backend
npm run dev
# Should show: Server running on port 5000
```

### 2. Start Your Frontend Server
```bash
cd frontend
npm run dev
# Should show: Local: http://localhost:5555/
```

### 3. Test the Connection

**Option A: Browser Console Test**
1. Open your browser to `http://localhost:5555`
2. Open Developer Tools (F12)
3. In the console, run:
```javascript
// Test API connection
testConnection()

// Run full API tests
testApi()
```

**Option B: Add Test Component** (Create this temporarily)

```javascript
// src/components/ApiTest.jsx
import React, { useState, useEffect } from 'react';
import { runApiTests } from '../utils/apiTest';

const ApiTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const results = await runApiTests();
    setTestResults(results);
    setLoading(false);
  };

  useEffect(() => {
    // Auto-run tests when component mounts (for development)
    runTests();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>API Connection Test</h2>
      <button onClick={runTests} disabled={loading}>
        {loading ? 'Running Tests...' : 'Run Tests Again'}
      </button>
      
      <div style={{ marginTop: '20px' }}>
        {testResults.map((result, index) => (
          <div key={index} style={{ 
            margin: '10px 0', 
            padding: '10px', 
            backgroundColor: result.status === 'PASS' ? '#d4edda' : '#f8d7da',
            border: `1px solid ${result.status === 'PASS' ? '#c3e6cb' : '#f5c6cb'}`,
            borderRadius: '4px'
          }}>
            <strong>{result.test}:</strong> {result.status}
            {result.error && <div>Error: {result.error}</div>}
            {result.note && <div>Note: {result.note}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApiTest;
```

## Expected Results

After completing Phase 1, you should see:
- ✅ Frontend running on http://localhost:5555
- ✅ Backend running on http://localhost:5000  
- ✅ Health check endpoint responding
- ✅ CORS allowing frontend to backend requests
- ✅ API service properly configured with interceptors
- ✅ Environment variables loaded correctly

## Troubleshooting Common Issues

### Issue: CORS Errors
**Solution:** Check that your backend CORS config includes `http://localhost:5555`

### Issue: Connection Refused
**Solution:** Make sure backend server is running on port 5000

### Issue: 404 on API calls
**Solution:** Verify API_BASE_URL includes `/api` at the end

### Issue: Environment variables not loading
**Solution:** Make sure `.env` file is in frontend root and variables start with `VITE_`

Ready to move to Phase 2? Let me know how the tests go!