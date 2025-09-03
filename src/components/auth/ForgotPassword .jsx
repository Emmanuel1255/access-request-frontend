
// ===== Updated Forgot Password Component (src/components/auth/ForgotPassword.jsx) =====
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Mail, Phone, Loader2, Shield, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

const ForgotPassword = ({ onBackToLogin }) => {
  const [step, setStep] = useState('request'); // 'request', 'reset', 'success'
  const [resetData, setResetData] = useState(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { resetPassword, resetPasswordWithOTP, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm();

  const newPassword = watch('newPassword');

  const onSubmitRequest = async (data) => {
    try {
      const result = await resetPassword(data.email);

      if (result.success) {
        setResetData({
          email: data.email,
          maskedPhone: result.maskedPhone
        });
        setStep('reset');
        toast.success('Reset code sent to your phone!');
      }
    } catch (error) {
      console.error('Password reset request error:', error);
    }
  };

  const onSubmitReset = async (data) => {
    try {
      const result = await resetPasswordWithOTP(
        resetData.email,
        data.otp,
        data.newPassword
      );

      if (result.success) {
        setStep('success');
        toast.success('Password reset successfully!');
      }
    } catch (error) {
      console.error('Password reset error:', error);
    }
  };

  const handleBackToRequest = () => {
    setStep('request');
    setResetData(null);
    reset();
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[@$!%*?&]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      return 'Password must contain uppercase, lowercase, number and special character';
    }

    return true;
  };

  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: '', color: '' };

    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;

    const levels = [
      { score: 0, label: '', color: '' },
      { score: 1, label: 'Very Weak', color: 'bg-red-500' },
      { score: 2, label: 'Weak', color: 'bg-orange-500' },
      { score: 3, label: 'Fair', color: 'bg-yellow-500' },
      { score: 4, label: 'Good', color: 'bg-blue-500' },
      { score: 5, label: 'Strong', color: 'bg-green-500' }
    ];

    return levels[score] || levels[0];
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-8 bg-africell-primary">
      <div className="max-w-md w-full mx-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100"
        >
          <AnimatePresence mode="wait">
            {step === 'request' && (
              <motion.div
                key="request"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center w-[12rem] mx-auto mb-4 ">
                    <img
                      src="/logo/africellLogo.png"
                      alt="Africell Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Reset Password
                  </h1>
                  <p className="text-gray-600">
                    Enter your email address and we'll send you a reset code
                  </p>
                </div>

                {/* Request Form */}
                <form onSubmit={handleSubmit(onSubmitRequest)} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        {...register('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address'
                          }
                        })}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-africell-primary focus:border-transparent transition-all duration-200 ${errors.email ? 'border-red-500' : 'border-gray-300'
                          }`}
                        placeholder="Enter your email"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-africell-primary to-africell-dark text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Sending...
                      </div>
                    ) : (
                      'Send Reset Code'
                    )}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => window.location.href = '/login'}
                      className="inline-flex items-center text-sm text-africell-primary hover:text-africell-dark transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Back to login
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === 'reset' && (
              <motion.div
                key="reset"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center w-[12rem] mx-auto mb-4 ">
                    <img
                      src="/logo/africellLogo.png"
                      alt="Africell Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Enter Reset Code
                  </h1>
                  <p className="text-gray-600">
                    We've sent a 6-digit code to{' '}
                    <span className="font-medium text-africell-primary">
                      {resetData?.maskedPhone || 'your phone'}
                    </span>
                  </p>
                </div>

                {/* Reset Form */}
                <form onSubmit={handleSubmit(onSubmitReset)} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      maxLength="6"
                      {...register('otp', {
                        required: 'Verification code is required',
                        pattern: {
                          value: /^[0-9]{6}$/,
                          message: 'Code must be 6 digits'
                        }
                      })}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-africell-primary focus:border-transparent transition-all duration-200 text-center text-lg tracking-widest ${errors.otp ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="000000"
                    />
                    {errors.otp && (
                      <p className="mt-1 text-sm text-red-500">{errors.otp.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        {...register('newPassword', {
                          required: 'New password is required',
                          validate: validatePassword
                        })}
                        className={`w-full px-4 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-africell-primary focus:border-transparent transition-all duration-200 ${errors.newPassword ? 'border-red-500' : 'border-gray-300'
                          }`}
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {newPassword && passwordStrength.score > 0 && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Password strength:</span>
                          <span className={`font-medium ${passwordStrength.score >= 4 ? 'text-green-600' :
                              passwordStrength.score >= 3 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                            {passwordStrength.label}
                          </span>
                        </div>
                        <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                            style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {errors.newPassword && (
                      <p className="mt-1 text-sm text-red-500">{errors.newPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        {...register('confirmPassword', {
                          required: 'Please confirm your password',
                          validate: (value) =>
                            value === newPassword || 'Passwords do not match'
                        })}
                        className={`w-full px-4 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-africell-primary focus:border-transparent transition-all duration-200 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                          }`}
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-africell-primary to-africell-dark text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Resetting...
                      </div>
                    ) : (
                      'Reset Password'
                    )}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleBackToRequest}
                      className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Try different email
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full bg-green-100">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Password Reset Successful!
                </h1>

                <p className="text-gray-600 mb-8">
                  Your password has been successfully reset. You can now log in with your new password.
                </p>

                <button
                  onClick={() => window.location.href = '/login'}
                  className="w-full bg-gradient-to-r from-africell-primary to-africell-dark text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Back to Login
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;