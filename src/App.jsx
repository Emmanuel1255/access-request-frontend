import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import DashboardLayout from './components/layout/DashboardLayout';
import LoginPage from './pages/auth/LoginPage';
import Dashboard from './pages/dashboard/Dashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import useAuthStore from './store/authStore';
import UserManagement from './pages/users/UserManagement';
import ProfileSettings from './pages/settings/ProfileSettings';

import RequestList from './pages/requests/RequestList';
import RequestDetail from './pages/requests/RequestDetail';
import CreateRequest from './pages/requests/CreateRequest';
import EditRequest from './pages/requests/EditRequest';
import SubmitRequest from './pages/requests/SubmitRequest';

import FormTemplateManager from './pages/forms/FormTemplateManager';
import FormBuilder from './components/forms/FormBuilder';
import CreateFormTemplate from './components/forms/CreateFormTemplate';
import EditFormTemplate from './components/forms/EditFormTemplate';
import ViewFormTemplate from './components/forms/ViewFormTemplate';
import PendingApprovals from './pages/approvals/PendingApprovals';

import AccessPassVerifier from './pages/access/AccessPassVerifier';
import VerifyAccessPass from './pages/access/VerifyAccessPass';
import AccessLogs from './pages/access/AccessLogs'; 

import SettingsPage from './pages/settings/SettingsPage';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route 
            path="/login" 
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
            } 
          />
          
         
          
          {/* Protected routes */}
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="requests" element={<RequestList />} />
            <Route path="requests/create" element={<CreateRequest />} />
            <Route path="requests/:id" element={<RequestDetail />} />
            <Route path="requests/:id/edit" element={<EditRequest />} />
            <Route path="requests/:id/submit" element={<SubmitRequest />} />
            <Route path="approvals" element={<PendingApprovals />} />
            <Route path="form-templates" element={<FormTemplateManager />} />
            <Route path="form-templates/create" element={<CreateFormTemplate />} />
            {/* <Route path="form-templates/:id" element={<FormBuilder />} /> */}
            <Route path="form-templates/:id/edit" element={<EditFormTemplate />} />
            <Route path="form-templates/:id" element={<ViewFormTemplate />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="reports" element={<div>Reports (Coming Soon)</div>} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="profile" element={<ProfileSettings />} />
            <Route path="access" element={<AccessPassVerifier />} />
            <Route path="verify/:number" element={<VerifyAccessPass />} />
            <Route path="access-logs" element={<AccessLogs />} />        
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        
        {/* Global toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              theme: {
                primary: '#10b981',
                secondary: 'black',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;