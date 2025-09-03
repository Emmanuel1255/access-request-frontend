# Frontend-Backend Connection Plan

## Current Architecture Overview

**Backend (Node.js/Express)**
- Port: 5000 (configurable via PORT env var)
- Base URL: `http://localhost:5000`
- API routes under `/api`
- CORS configured for development (`*`) and production (`http://localhost:5555`)

**Frontend (React/Vite)**
- Uses React with Vite as build tool
- Store management with custom stores (Zustand-like pattern)
- API calls scattered through components

## 1. API Service Layer Configuration

### Step 1: Create Centralized API Configuration

Create `src/services/api.js` in your frontend:

```javascript
// src/services/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Step 2: Environment Configuration

Create `.env` in your frontend root:

```bash
# Frontend Environment Configuration
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=Request Approval System
VITE_NODE_ENV=development
```

Update `vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5555,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  define: {
    'process.env': process.env
  }
})
```

## 2. API Service Methods

### Step 3: Create Service Files for Each Domain

**Auth Service** (`src/services/authService.js`):

```javascript
import api from './api';

export const authService = {
  loginAD: async (username, password) => {
    const response = await api.post('/auth/login-ad', { username, password });
    return response.data;
  },

  loginLocal: async (email, password) => {
    const response = await api.post('/auth/login-local', { email, password });
    return response.data;
  },

  verifyOTP: async (userId, otpCode, type = 'login') => {
    const response = await api.post('/auth/verify-otp', { userId, otpCode, type });
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/refresh-token', { refreshToken });
    return response.data;
  }
};
```

**Request Service** (`src/services/requestService.js`):

```javascript
import api from './api';

export const requestService = {
  getRequests: async (params = {}) => {
    const response = await api.get('/requests', { params });
    return response.data;
  },

  getRequestById: async (requestId) => {
    const response = await api.get(`/requests/${requestId}`);
    return response.data;
  },

  createRequest: async (requestData) => {
    const response = await api.post('/requests', requestData);
    return response.data;
  },

  updateRequest: async (requestId, requestData) => {
    const response = await api.put(`/requests/${requestId}`, requestData);
    return response.data;
  },

  processApproval: async (requestId, approvalData) => {
    const response = await api.post(`/requests/${requestId}/process`, approvalData);
    return response.data;
  },

  addComment: async (requestId, commentData) => {
    const response = await api.post(`/requests/${requestId}/comments`, commentData);
    return response.data;
  },

  withdrawRequest: async (requestId, reason) => {
    const response = await api.post(`/requests/${requestId}/withdraw`, { reason });
    return response.data;
  }
};
```

**Form Template Service** (`src/services/formTemplateService.js`):

```javascript
import api from './api';

export const formTemplateService = {
  getTemplates: async (params = {}) => {
    const response = await api.get('/form-templates', { params });
    return response.data;
  },

  getTemplateById: async (templateId) => {
    const response = await api.get(`/form-templates/${templateId}`);
    return response.data;
  },

  createTemplate: async (templateData) => {
    const response = await api.post('/form-templates', templateData);
    return response.data;
  },

  updateTemplate: async (templateId, templateData) => {
    const response = await api.put(`/form-templates/${templateId}`, templateData);
    return response.data;
  },

  deleteTemplate: async (templateId) => {
    const response = await api.delete(`/form-templates/${templateId}`);
    return response.data;
  }
};
```

## 3. Store Updates

### Step 4: Update Your Stores to Use API Services

Update `src/store/authStore.js`:

```javascript
import { create } from 'zustand';
import { authService } from '../services/authService';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const response = await authService.loginAD(credentials.username, credentials.password);
      
      if (response.requiresOTP) {
        set({ 
          loading: false,
          pendingAuth: {
            userId: response.userId,
            contactInfo: response.contactInfo
          }
        });
        return response;
      }

      localStorage.setItem('authToken', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
      
      set({
        user: response.user,
        isAuthenticated: true,
        loading: false,
        error: null
      });
      
      return response;
    } catch (error) {
      set({ 
        loading: false, 
        error: error.response?.data?.message || 'Login failed' 
      });
      throw error;
    }
  },

  verifyOTP: async (otpData) => {
    set({ loading: true, error: null });
    try {
      const response = await authService.verifyOTP(
        otpData.userId, 
        otpData.otpCode, 
        otpData.type
      );

      localStorage.setItem('authToken', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
      
      set({
        user: response.user,
        isAuthenticated: true,
        loading: false,
        error: null,
        pendingAuth: null
      });
      
      return response;
    } catch (error) {
      set({ 
        loading: false, 
        error: error.response?.data?.message || 'OTP verification failed' 
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      set({
        user: null,
        isAuthenticated: false,
        pendingAuth: null,
        error: null
      });
    }
  }
}));

export default useAuthStore;
```

## 4. Error Handling Strategy

### Step 5: Global Error Handling

Create `src/utils/errorHandler.js`:

```javascript
import toast from 'react-hot-toast';

export const handleApiError = (error, customMessage = null) => {
  console.error('API Error:', error);
  
  let message = customMessage || 'An unexpected error occurred';
  
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    if (data?.message) {
      message = data.message;
    } else if (data?.error) {
      message = data.error;
    } else if (status === 401) {
      message = 'Authentication required';
    } else if (status === 403) {
      message = 'Access denied';
    } else if (status === 404) {
      message = 'Resource not found';
    } else if (status === 422) {
      message = 'Validation error';
    } else if (status >= 500) {
      message = 'Server error. Please try again later.';
    }
  } else if (error.request) {
    // Network error
    message = 'Network error. Please check your connection.';
  }
  
  toast.error(message);
  return message;
};

export const handleValidationErrors = (errors) => {
  if (Array.isArray(errors)) {
    errors.forEach(error => {
      toast.error(`${error.field}: ${error.message}`);
    });
  }
};
```

## 5. Component Integration

### Step 6: Update Components to Use Services

Update your `LoginPage.jsx`:

```javascript
// In onSubmit function
const onSubmit = async (data) => {
  setLoading(true);
  try {
    const response = await login(data);
    
    if (response.requiresOTP) {
      // Navigate to OTP verification
      navigate('/verify-otp', { 
        state: { 
          userId: response.userId, 
          contactInfo: response.contactInfo 
        } 
      });
    } else {
      toast.success('Login successful!');
      navigate(from);
    }
  } catch (error) {
    handleApiError(error, 'Login failed');
  } finally {
    setLoading(false);
  }
};
```

### Step 7: File Upload Configuration

For file uploads, create `src/services/fileService.js`:

```javascript
import api from './api';

export const fileService = {
  uploadFile: async (file, requestId = null) => {
    const formData = new FormData();
    formData.append('file', file);
    if (requestId) formData.append('requestId', requestId);

    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        // Handle upload progress
        console.log(`Upload Progress: ${percentCompleted}%`);
      }
    });

    return response.data;
  },

  downloadFile: async (fileId) => {
    const response = await api.get(`/files/${fileId}`, {
      responseType: 'blob'
    });
    return response;
  }
};
```

## 6. Backend Updates Needed

### Step 8: Backend CORS Update

Update your `src/app.js` CORS configuration:

```javascript
app.use(cors({
  origin: process.env.NODE_ENV === 'development' 
    ? ['http://localhost:5555', 'http://127.0.0.1:5555']
    : process.env.FRONTEND_URL || 'http://localhost:5555',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Step 9: Add Frontend URL to Environment

Update your backend `.env`:

```bash
# Add this to your backend .env
FRONTEND_URL=http://localhost:5555
```

## 7. Development Workflow

### Step 10: Development Scripts

Update your `package.json` scripts (frontend):

```json
{
  "scripts": {
    "dev": "vite --host",
    "build": "vite build",
    "preview": "vite preview",
    "dev:backend": "cd ../backend && npm run dev",
    "dev:full": "concurrently \"npm run dev:backend\" \"npm run dev\""
  }
}
```

## 8. Testing Strategy

### Step 11: API Testing

Create `src/utils/apiTest.js` for development:

```javascript
import { authService } from '../services/authService';
import { requestService } from '../services/requestService';

export const testApiConnection = async () => {
  try {
    console.log('Testing API connection...');
    
    // Test health endpoint
    const health = await fetch('http://localhost:5000/health');
    const healthData = await health.json();
    console.log('Health check:', healthData);
    
    // Test API routes
    const requests = await requestService.getRequests({ page: 1, limit: 5 });
    console.log('Requests test:', requests);
    
    return true;
  } catch (error) {
    console.error('API connection test failed:', error);
    return false;
  }
};
```

## 9. Implementation Checklist

### Phase 1: Core Setup
- [ ] Create API service with axios configuration
- [ ] Set up environment variables
- [ ] Configure Vite proxy for development
- [ ] Update CORS settings on backend

### Phase 2: Service Layer
- [ ] Create authService
- [ ] Create requestService  
- [ ] Create formTemplateService
- [ ] Create fileService

### Phase 3: Store Updates
- [ ] Update authStore to use API services
- [ ] Update requestStore to use API services
- [ ] Update formTemplateStore to use API services

### Phase 4: Component Updates
- [ ] Update LoginPage with proper API calls
- [ ] Update request creation/editing components
- [ ] Update form template components
- [ ] Add error handling throughout

### Phase 5: Testing & Polish
- [ ] Test all API endpoints
- [ ] Add loading states
- [ ] Implement proper error handling
- [ ] Add retry mechanisms for failed requests

## Next Steps

1. **Start with API service setup** - This provides the foundation
2. **Update one store at a time** - Begin with authStore as it's critical
3. **Update components incrementally** - Start with login/auth flow
4. **Add comprehensive error handling** - Users need clear feedback
5. **Test thoroughly** - Ensure all happy paths and error cases work

This plan provides a structured approach to connecting your frontend and backend while maintaining clean architecture and good developer experience.