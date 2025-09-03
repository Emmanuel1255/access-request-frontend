# Phase 4: Component Updates Implementation

## Step 1: Update Login Page Component

### Update `src/pages/auth/LoginPage.jsx`

```javascript
// src/pages/auth/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Validation schema
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Store state and actions
  const { 
    login, 
    loading, 
    error, 
    isAuthenticated,
    clearError 
  } = useAuthStore();

  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Clear errors when component mounts or when user starts typing
  useEffect(() => {
    clearError();
  }, [clearError]);

  const onSubmit = async (data) => {
    try {
      clearErrors();
      clearError();
      
      const result = await login(data);
      
      if (result.requiresOTP) {
        // Navigate to OTP verification page
        navigate('/verify-otp', { 
          state: { 
            userId: result.userId, 
            contactInfo: result.contactInfo,
            username: data.username
          } 
        });
      } else {
        // Direct login success
        toast.success('Login successful!');
        navigate(from, { replace: true });
      }
    } catch (error) {
      // Error is already handled by the store and toast
      console.error('Login failed:', error);
      
      // Handle validation errors
      if (error.validationErrors && Array.isArray(error.validationErrors)) {
        error.validationErrors.forEach(validationError => {
          setError(validationError.field || 'username', {
            type: 'server',
            message: validationError.message
          });
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full mx-4"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-16 h-16 bg-africell-primary rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <LogIn className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
            <p className="text-gray-600 mt-2">Sign in to your account</p>
          </div>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-red-600 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                {...register('username')}
                type="text"
                id="username"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-africell-primary focus:border-transparent transition-colors ${
                  errors.username ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your username"
                disabled={loading}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-africell-primary focus:border-transparent transition-colors pr-12 ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full py-3 text-lg font-medium"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Signing In...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </div>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Having trouble signing in?{' '}
              <button
                onClick={() => navigate('/forgot-password')}
                className="text-africell-primary hover:underline font-medium"
                disabled={loading}
              >
                Reset Password
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
```

## Step 2: Create OTP Verification Page

### Create `src/pages/auth/OTPVerification.jsx`

```javascript
// src/pages/auth/OTPVerification.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, RefreshCw, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import Button from '../../components/common/Button';

const OTPVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Store state and actions
  const { 
    verifyOTP, 
    resendOTP, 
    loading, 
    error, 
    isAuthenticated,
    pendingAuth,
    clearError 
  } = useAuthStore();

  const { userId, contactInfo, username } = location.state || pendingAuth || {};

  // Redirect if no pending auth or already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    } else if (!userId) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, userId, navigate]);

  // Handle resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (value && index === 5 && newOtp.every(digit => digit)) {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter' && otp.every(digit => digit)) {
      handleVerifyOTP(otp.join(''));
    }
  };

  const handleVerifyOTP = async (otpCode = null) => {
    const otpToVerify = otpCode || otp.join('');
    
    if (otpToVerify.length !== 6) {
      toast.error('Please enter all 6 digits');
      return;
    }

    try {
      clearError();
      await verifyOTP(otpToVerify);
      toast.success('Verification successful!');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      // Error is already handled by the store
      console.error('OTP verification failed:', error);
      
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    try {
      clearError();
      await resendOTP();
      setResendCooldown(60); // 60 second cooldown
    } catch (error) {
      // Error is already handled by the store
      console.error('Resend OTP failed:', error);
    }
  };

  const handleGoBack = () => {
    navigate('/login');
  };

  if (!userId) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full mx-4"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Shield className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-900">Verify Your Identity</h2>
            <p className="text-gray-600 mt-2">
              We've sent a 6-digit code to your registered contact
            </p>
            {contactInfo && (
              <p className="text-sm text-gray-500 mt-1">
                {contactInfo.email && `Email: ${contactInfo.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')}`}
                {contactInfo.phoneNumber && ` • Phone: ${contactInfo.phoneNumber.replace(/(.{3})(.*)(.{2})/, '$1***$3')}`}
              </p>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-red-600 text-sm">{error}</p>
            </motion.div>
          )}

          {/* OTP Input */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
              Enter the 6-digit code
            </label>
            <div className="flex justify-center space-x-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-africell-primary focus:ring-2 focus:ring-africell-primary/20 transition-colors"
                  disabled={loading}
                />
              ))}
            </div>
          </div>

          {/* Verify Button */}
          <Button
            onClick={() => handleVerifyOTP()}
            variant="primary"
            className="w-full py-3 mb-4"
            disabled={loading || otp.some(digit => !digit)}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Verifying...
              </div>
            ) : (
              'Verify Code'
            )}
          </Button>

          {/* Resend Code */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
            <Button
              onClick={handleResendOTP}
              variant="ghost"
              className="text-africell-primary hover:text-africell-primary/80"
              disabled={loading || resendCooldown > 0}
            >
              {resendCooldown > 0 ? (
                `Resend in ${resendCooldown}s`
              ) : (
                <div className="flex items-center">
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Resend Code
                </div>
              )}
            </Button>
          </div>

          {/* Back to Login */}
          <Button
            onClick={handleGoBack}
            variant="outline"
            className="w-full"
            disabled={loading}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default OTPVerification;
```

## Step 3: Update Create Request Component

### Update `src/pages/requests/CreateRequest.jsx`

```javascript
// src/pages/requests/CreateRequest.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  Save,
  Send,
  FileText,
  AlertCircle,
  CheckCircle,
  Edit as EditIcon,
  Users,
  Crown,
  UserCheck,
  User,
  Info,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

import useFormTemplateStore from '../../store/formTemplateStore';
import useRequestStore from '../../store/requestStore';
import useAuthStore from '../../store/authStore';

import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import DynamicForm from '../../components/forms/DynamicForm';
import { REQUEST_PRIORITY } from '../../data/demoData';

// Validation schema
const requestSchema = z.object({
  templateId: z.number().min(1, 'Please select a template'),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
  formData: z.object({}).passthrough()
});

// Role Icon Component
const RoleIcon = ({ role, className = 'w-4 h-4' }) => {
  switch (role) {
    case 'admin':
      return <Crown className={`text-yellow-600 ${className}`} />;
    case 'manager':
      return <UserCheck className={`text-blue-600 ${className}`} />;
    case 'approver':
      return <User className={`text-green-600 ${className}`} />;
    default:
      return <User className={`text-gray-600 ${className}`} />;
  }
};

const roleBadgeClass = (role) => {
  switch (role) {
    case 'admin':
      return 'bg-yellow-100 text-yellow-800';
    case 'manager':
      return 'bg-blue-100 text-blue-800';
    case 'approver':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Approvers Summary Component
const ApproversSummary = ({ approvers = [], mode = 'sequential' }) => {
  const modeExplainer =
    mode === 'sequential'
      ? 'Approvers must approve in the specified order.'
      : 'Any of the listed approvers can approve this request.';

  if (!approvers.length) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-gray-500 text-sm">No approvers configured for this template.</p>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 rounded-lg p-4">
      <div className="flex items-center mb-3">
        <Users className="w-5 h-5 text-blue-600 mr-2" />
        <h4 className="font-medium text-blue-900">Approval Chain</h4>
        <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
          {mode}
        </span>
      </div>
      <p className="text-sm text-blue-700 mb-3">{modeExplainer}</p>
      
      <div className="space-y-2">
        {approvers.map((a, idx) => (
          <div key={idx} className="flex items-center p-2 bg-white rounded border">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-700 mr-3">
              {mode === 'sequential' ? (a.order || idx + 1) : (a.userName?.[0]?.toUpperCase() || '?')}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex gap-2 items-center">
                <span className="text-sm font-medium text-gray-900 truncate">{a.userName}</span>
                <RoleIcon role={a.userRole} />
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleBadgeClass(a.userRole)}`}>
                  {a.userRole}
                </span>
                {a.isRequired && (
                  <span className="ml-1 text-xs text-red-500" title="Required approval">
                    *
                  </span>
                )}
                {a.canDelegate && (
                  <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-700">
                    can delegate
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-600">
                {a.userJobTitle} • {a.userDepartment}
              </div>
              {a.userEmail && (
                <div className="text-xs text-gray-500 truncate">{a.userEmail}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Component
const CreateRequest = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [step, setStep] = useState(1); // 1: Template, 2: Details, 3: Review

  const navigate = useNavigate();

  // Store state and actions
  const { 
    templates, 
    fetchTemplates, 
    loading: templatesLoading 
  } = useFormTemplateStore();
  
  const { 
    createRequest, 
    loading: requestLoading 
  } = useRequestStore();
  
  const { user } = useAuthStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    setError,
    clearErrors
  } = useForm({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      templateId: 0,
      title: '',
      priority: 'normal',
      formData: {}
    }
  });

  const watchedValues = watch();
  const loading = templatesLoading || requestLoading;

  // Fetch templates on mount
  useEffect(() => {
    fetchTemplates({ isActive: true }).catch((error) => {
      console.error('Failed to fetch templates:', error);
    });
  }, [fetchTemplates]);

  // Update form data when template changes
  useEffect(() => {
    if (selectedTemplate) {
      setValue('templateId', selectedTemplate.id);
      // Reset form data when template changes
      setFormData({});
      setValidationErrors({});
    }
  }, [selectedTemplate, setValue]);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setStep(2);
  };

  const handleFormDataChange = (newFormData, errors = {}) => {
    setFormData(newFormData);
    setValidationErrors(errors);
  };

  const validateFormData = () => {
    if (!selectedTemplate?.formSchema?.fields) return true;
    
    const errors = {};
    let hasErrors = false;

    selectedTemplate.formSchema.fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        errors[field.name] = `${field.label} is required`;
        hasErrors = true;
      }
    });

    setValidationErrors(errors);
    return !hasErrors;
  };

  const onSubmit = async (data) => {
    try {
      clearErrors();
      
      // Validate form data
      if (!validateFormData()) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Prepare request data
      const requestData = {
        templateId: parseInt(data.templateId),
        title: data.title.trim(),
        priority: data.priority,
        formData: formData,
        description: `Request created using template: ${selectedTemplate.templateName}`
      };

      // Create request
      const result = await createRequest(requestData);
      
      // Success - navigate to request details
      navigate(`/requests/${result.request.id}`, { 
        state: { message: result.message } 
      });
      
    } catch (error) {
      console.error('Failed to create request:', error);
      
      // Handle validation errors
      if (error.validationErrors && Array.isArray(error.validationErrors)) {
        error.validationErrors.forEach(validationError => {
          setError(validationError.field || 'title', {
            type: 'server',
            message: validationError.message
          });
        });
      }
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Request Template</h3>
              
              {templates.length === 0 && !templatesLoading ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No templates available</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {templates.map((template) => (
                    <motion.div
                      key={template.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleTemplateSelect(template)}
                      className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-africell-primary hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{template.templateName}</h4>
                          <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                          <div className="flex items-center mt-2 space-x-4">
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                              {template.category}
                            </span>
                            <span className="text-xs text-gray-500">
                              {template.formSchema?.fields?.length || 0} fields
                            </span>
                            {template.approvalConfig?.approvers && (
                              <span className="text-xs text-blue-600">
                                {JSON.parse(template.approvalConfig.approvers).length} approvers
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Request Details</h3>
              <Button
                variant="ghost"
                onClick={() => setStep(1)}
                className="text-gray-600"
              >
                Change Template
              </Button>
            </div>

            {/* Template Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <FileText className="w-5 h-5 text-gray-600 mr-2" />
                <span className="font-medium text-gray-900">{selectedTemplate?.templateName}</span>
              </div>
              <p className="text-sm text-gray-600">{selectedTemplate?.description}</p>
            </div>

            {/* Basic Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Request Title *
                </label>
                <input
                  {...register('title')}
                  type="text"