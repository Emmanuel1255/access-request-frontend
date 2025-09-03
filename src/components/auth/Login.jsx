// ===== Login Component (src/components/auth/Login.jsx) =====
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Phone, Mail, Loader2, Shield, Building2, AlertCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import OTPVerification from './OTPVerification';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [detectedMethod, setDetectedMethod] = useState('local'); // Auto-detected method
  const [attemptCount, setAttemptCount] = useState(0);
  
  const { login, loginWithAD, isLoading, pendingOTP } = useAuthStore();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
    clearErrors,
    watch
  } = useForm();

  // Watch email field for auto-detection
  const emailValue = watch('email', '');

  // Auto-detect login method based on email domain
  useEffect(() => {
    if (emailValue && emailValue.includes('@')) {
      const domain = emailValue.split('@')[1]?.toLowerCase();
      if (domain === 'africell.sl') {
        setDetectedMethod('ad');
      } else {
        setDetectedMethod('local');
      }
    } else {
      setDetectedMethod('local');
    }
  }, [emailValue]);

  // Clear any form errors when user starts typing
  const handleInputChange = (fieldName) => {
    return (e) => {
      clearErrors(fieldName);
      // Also clear all errors if user is actively typing
      if (fieldName === 'password' && e.target.value.length > 0) {
        clearErrors('password');
      }
      if (fieldName === 'email' && e.target.value.length > 0) {
        clearErrors('email');
      }
    };
  };

  // Extract username from email for AD login
  const extractUsername = (email) => {
    if (email && email.includes('@')) {
      return email.split('@')[0];
    }
    return email;
  };

  // Get user-friendly error message and show as toast
  const showErrorToast = (error, method = 'local') => {
    const errorCode = error.response?.data?.code || error.code;
    const errorMessage = error.response?.data?.error || error.message;

    switch (errorCode) {
      case 'INVALID_CREDENTIALS':
        toast.error(
          method === 'ad' 
            ? 'Invalid domain credentials. Please check your username and password.' 
            : 'Invalid email or password. Please check your credentials and try again.',
          { duration: 5000 }
        );
        break;
      
      case 'USER_NOT_FOUND':
        toast.error(
          method === 'ad'
            ? 'No account found with these domain credentials. Contact your system administrator.'
            : 'No account found with this email address. Please check your email.',
          { duration: 5000 }
        );
        break;
      
      case 'ACCOUNT_LOCKED':
        toast.error(
          'Account temporarily locked due to multiple failed attempts. Try again later or contact support.',
          { 
            duration: 8000,
            icon: '🔒'
          }
        );
        break;
      
      case 'INVALID_DOMAIN':
        toast.error(
          'This email domain is not configured for Active Directory authentication.',
          { duration: 5000 }
        );
        break;
      
      case 'AD_AUTH_FAILED':
        toast.error(
          'Active Directory authentication failed. Check your domain credentials.',
          { duration: 5000 }
        );
        break;
      
      case 'AD_USER_INFO_FAILED':
        toast.error(
          'Could not retrieve user information from Active Directory. Contact your system administrator.',
          { duration: 6000 }
        );
        break;
      
      case 'OTP_SEND_FAILED':
        toast.error(
          'Failed to send verification code. Please check your phone number and try again.',
          { 
            duration: 5000,
            icon: '📱'
          }
        );
        break;
      
      case 'SERVICE_ERROR':
        toast.error(
          'Authentication service temporarily unavailable. Please try again in a moment.',
          { duration: 4000 }
        );
        break;
      
      case 'NETWORK_ERROR':
        toast.error(
          'Connection error. Please check your internet connection and try again.',
          { 
            duration: 4000,
            icon: '🌐'
          }
        );
        break;
      
      default:
        toast.error(
          errorMessage || 'Login failed. Please try again or contact support if the problem persists.',
          { duration: 4000 }
        );
        break;
    }

    // Show additional help after multiple attempts
    if (attemptCount >= 2) {
      setTimeout(() => {
        toast(
          `Having trouble? Try a different email address or contact support.`,
          {
            duration: 6000,
            icon: '💡',
            style: {
              background: '#f3f4f6',
              color: '#374151',
            }
          }
        );
      }, 1000);
    }
  };

  const handleSubmitForm = async (data, event) => {
    // Prevent default form submission and page reload
    event?.preventDefault();
    
    // Validate that we have both email and password
    if (!data.email || !data.password) {
      console.error('Missing email or password in form data');
      if (!data.email) {
        setError('email', { type: 'manual', message: 'Email is required' });
      }
      if (!data.password) {
        setError('password', { type: 'manual', message: 'Password is required' });
      }
      return;
    }
    
    try {
      setAttemptCount(prev => prev + 1);
      
      // Determine which authentication method to use based on email domain
      const isADLogin = detectedMethod === 'ad';
      
      let result;
      
      if (isADLogin) {
        // For AD login: extract username from email and send username + password
        const username = extractUsername(data.email);
        console.log('AD Login - Username extracted:', username);
        
        toast.loading('Authenticating with Active Directory...', { id: 'auth-loading' });
        
        result = await loginWithAD(username, data.password);
        
        toast.dismiss('auth-loading');
        
        if (result.requiresOTP) {
          toast.success('Active Directory authentication successful! Please check your email for OTP.', {
            duration: 4000,
            icon: '📧'
          });
        } else {
          toast.success('Login successful!', {
            icon: '✅'
          });
        }
      } else {
        // For standard login: send email + password
        console.log('Standard Login - Email:', data.email);
        
        toast.loading('Signing in...', { id: 'auth-loading' });
        
        result = await login(data.email, data.password);
        
        toast.dismiss('auth-loading');
        
        if (result.requiresOTP) {
          toast.success('Password verified! Please check your phone for OTP.', {
            duration: 4000,
            icon: '📱'
          });
        } else {
          toast.success('Login successful!', {
            icon: '✅'
          });
        }
      }
      
    } catch (error) {
      toast.dismiss('auth-loading');
      console.error('Login error:', error);
      showErrorToast(error, detectedMethod);
      
      // Set form-level errors for specific cases
      if (error.response?.data?.code === 'INVALID_CREDENTIALS' || error.response?.data?.code === 'AD_AUTH_FAILED') {
        setError('password', { 
          type: 'manual', 
          message: detectedMethod === 'ad' ? 'Authentication failed' : 'Incorrect password'
        });
      }
    }
  };

  // Show OTP verification if pending
  if (pendingOTP) {
    return <OTPVerification />;
  }

  return (
    <div className="flex justify-center items-center px-4 py-8 min-h-screen bg-africell-primary">
      <div className="mx-4 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-8 bg-white rounded-2xl border border-gray-100 shadow-2xl"
        >
          {/* Logo and Header */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center w-[12rem] mx-auto mb-4">
              <img
                src="/logo/africellLogo.png"
                alt="Africell Logo"
                className="object-contain w-full h-full"
                onError={(e) => {
                  e.target.style.display = 'none';
                  // Show fallback icon if logo fails to load
                  const fallback = document.createElement('div');
                  fallback.className = 'flex justify-center items-center w-16 h-16 bg-gradient-to-r rounded-full from-africell-primary to-africell-secondary';
                  fallback.innerHTML = '<svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2L3 7v11h4v-6h6v6h4V7l-7-5z"/></svg>';
                  e.target.parentNode.appendChild(fallback);
                }}
              />
            </div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              eSIM Management
            </h1>
            <p className="text-gray-600">
              Sign in to your account to continue
            </p>
          </div>

          {/* Auto-Detection Indicator */}
          

          {/* Login Form */}
          <form 
            onSubmit={handleSubmit(handleSubmitForm)} 
            className="space-y-6"
            noValidate
          >
            {/* Email Field */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 w-5 h-5 text-gray-400 transform -translate-y-1/2" />
                <input
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Please enter a valid email address'
                    }
                  })}
                  onChange={handleInputChange('email')}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-africell-primary focus:border-transparent transition-all duration-200 ${
                    errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email address"
                />
                {/* Domain indicator */}
                {emailValue && emailValue.includes('@') && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {detectedMethod === 'ad' ? (
                      <Building2 className="w-5 h-5 text-blue-500" />
                    ) : (
                      <Shield className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                )}
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center mt-1 text-sm text-red-500"
                >
                  <AlertCircle className="mr-1 w-4 h-4" />
                  {errors.email.message}
                </motion.p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 3,
                      message: 'Password must be at least 3 characters'
                    }
                  })}
                  onChange={handleInputChange('password')}
                  className={`w-full pl-4 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-africell-primary focus:border-transparent transition-all duration-200 ${
                    errors.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 text-gray-400 transition-colors transform -translate-y-1/2 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center mt-1 text-sm text-red-500"
                >
                  <AlertCircle className="mr-1 w-4 h-4" />
                  {errors.password.message}
                </motion.p>
              )}
            </div>

            {/* Login Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="px-4 py-3 w-full font-medium text-white bg-gradient-to-r rounded-lg transition-all duration-200 transform from-africell-primary to-africell-dark hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
            >
              {isLoading ? (
                <div className="flex justify-center items-center">
                  <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                  {detectedMethod === 'ad' ? 'Authenticating with AD...' : 'Signing in...'}
                </div>
              ) : (
                <>
                  {detectedMethod === 'ad' ? (
                    <>
                      <Building2 className="inline mr-2 w-4 h-4" />
                      Sign in with Active Directory
                    </>
                  ) : (
                    <>
                      <Mail className="inline mr-2 w-4 h-4" />
                      Sign in
                    </>
                  )}
                </>
              )}
            </motion.button>

            {/* Forgot Password Link - Only for non-AD login */}
            {detectedMethod === 'local' && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => window.location.href = '/forgot-password'}
                  className="text-sm transition-colors text-africell-primary hover:text-africell-dark hover:underline"
                >
                  Forgot your password?
                </button>
              </div>
            )}
          </form>

          {/* Info Text */}
          {/* <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              {detectedMethod === 'ad' 
                ? 'Using Active Directory authentication for @africell.sl domain'
                : 'You will receive an OTP for verification'
              }
            </p>
          </div> */}
        </motion.div>
      </div>
    </div>
  );
};

export default Login;