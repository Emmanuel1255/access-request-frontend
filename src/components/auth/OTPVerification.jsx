// ===== Improved OTP Verification Component (src/components/auth/OTPVerification.jsx) =====
import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Shield, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

const OTPVerification = () => {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);
  
  const { verifyOTP, isLoading, pendingOTP, login, loginWithAD } = useAuthStore();
  
  const {
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors
  } = useForm();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (index, value) => {
    // Remove any non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, '');
    
    // Take only the last character if multiple are entered
    const singleDigit = numericValue.slice(-1);
    
    // Update the state
    const newOtpValues = [...otpValues];
    newOtpValues[index] = singleDigit;
    setOtpValues(newOtpValues);
    
    // Clear any previous errors
    clearErrors();
    
    // Auto-focus next input if current input has a value
    if (singleDigit && index < 5) {
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus();
      }, 0);
    }
    
    // Auto-submit when all 6 digits are entered
    if (index === 5 && singleDigit) {
      const completeOtp = [...newOtpValues.slice(0, 5), singleDigit];
      if (completeOtp.every(digit => digit !== '')) {
        setTimeout(() => {
          handleOTPSubmit(completeOtp.join(''));
        }, 100);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      e.preventDefault();
      
      if (otpValues[index]) {
        // Clear current input
        const newOtpValues = [...otpValues];
        newOtpValues[index] = '';
        setOtpValues(newOtpValues);
      } else if (index > 0) {
        // Move to previous input and clear it
        const newOtpValues = [...otpValues];
        newOtpValues[index - 1] = '';
        setOtpValues(newOtpValues);
        inputRefs.current[index - 1]?.focus();
      }
    }
    
    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Handle Enter key
    if (e.key === 'Enter') {
      e.preventDefault();
      const otp = otpValues.join('');
      if (otp.length === 6) {
        handleOTPSubmit(otp);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text');
    const pasteArray = paste.replace(/[^0-9]/g, '').split('').slice(0, 6);
    
    if (pasteArray.length > 0) {
      const newOtpValues = [...otpValues];
      pasteArray.forEach((digit, index) => {
        if (index < 6) {
          newOtpValues[index] = digit;
        }
      });
      
      // Fill remaining slots with empty strings
      for (let i = pasteArray.length; i < 6; i++) {
        newOtpValues[i] = '';
      }
      
      setOtpValues(newOtpValues);
      
      // Focus on the next empty input or the last input
      const nextEmptyIndex = newOtpValues.findIndex(val => val === '');
      const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : Math.min(pasteArray.length, 5);
      
      setTimeout(() => {
        inputRefs.current[focusIndex]?.focus();
      }, 0);
      
      // Auto-submit if all 6 digits are pasted
      if (pasteArray.length === 6) {
        setTimeout(() => {
          handleOTPSubmit(newOtpValues.join(''));
        }, 100);
      }
    }
  };

  const handleOTPSubmit = async (otp) => {
    if (otp.length !== 6) {
      setError('otp', { message: 'Please enter the complete 6-digit OTP' });
      toast.error('Please enter the complete 6-digit OTP');
      return;
    }

    try {
      await verifyOTP(otp);
    } catch (error) {
      console.error('OTP verification error:', error);
      // Clear the OTP inputs on error
      setOtpValues(['', '', '', '', '', '']);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  };

  const onSubmit = async () => {
    const otp = otpValues.join('');
    await handleOTPSubmit(otp);
  };

  const handleResendOTP = async () => {
    if (!canResend || !pendingOTP) return;
    
    try {
      // Determine which login method to use based on stored data
      const isADLogin = pendingOTP.contactInfo?.includes('@');
      
      if (isADLogin) {
        await loginWithAD(pendingOTP.contactInfo, 'resend');
      } else {
        await login(pendingOTP.contactInfo, 'resend');
      }
      
      setTimeLeft(300);
      setCanResend(false);
      setOtpValues(['', '', '', '', '', '']);
      toast.success('OTP resent successfully!');
      
      // Focus first input after resend
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch (error) {
      console.error('Resend OTP error:', error);
    }
  };

  const handleGoBack = () => {
    // Reset OTP state and go back to login
    useAuthStore.setState({ pendingOTP: null });
  };

  const handleInputFocus = (index) => {
    // Select all text when input is focused
    inputRefs.current[index]?.select();
  };

  if (!pendingOTP) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-8 bg-africell-primary">
      <div className="max-w-md w-full mx-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        >
          {/* Header */}
         <div className="text-center mb-8 top-8 relative">
            <div className="flex items-center justify-center w-[12rem] mx-auto mb-4 "> 
              <img
                src="/logo/africellLogo.png"
                alt="Africell Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verify Your Identity
            </h1>
            <p className="text-gray-600">
              We've sent a 6-digit code to{' '}
              <span className="font-medium text-africell-primary">
                {pendingOTP.contactInfo}
              </span>
            </p>
          </div>
          <div className="p-8">
            {/* OTP Input Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                  Enter the 6-digit verification code
                </label>
                <div className="flex justify-center space-x-3">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <motion.input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength="1"
                      value={otpValues[index]}
                      className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-lg transition-all duration-200 ${
                        otpValues[index] 
                          ? 'border-africell-primary bg-africell-primary/5' 
                          : 'border-gray-300'
                      } focus:border-africell-primary focus:ring-2 focus:ring-africell-primary focus:ring-opacity-20 focus:outline-none`}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      onFocus={() => handleInputFocus(index)}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1 * index }}
                    />
                  ))}
                </div>
                {errors.otp && (
                  <p className="mt-2 text-sm text-red-500 text-center">
                    {errors.otp.message}
                  </p>
                )}
              </div>

              {/* Timer */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  {timeLeft > 0 ? (
                    <>Code expires in <span className="font-medium text-africell-primary">{formatTime(timeLeft)}</span></>
                  ) : (
                    <span className="text-red-500">Code expired</span>
                  )}
                </p>
              </div>

              {/* Verify Button */}
              <motion.button
                type="submit"
                disabled={isLoading || otpValues.join('').length !== 6}
                className="w-full px-6 py-3 font-medium text-white transition-all duration-200 transform rounded-lg shadow-lg bg-africell-primary hover:bg-africell-dark hover:scale-105 active:scale-95 hover:shadow-africell disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Verifying...
                  </div>
                ) : (
                  'Verify Code'
                )}
              </motion.button>

              {/* Resend Button */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={!canResend || isLoading}
                  className="inline-flex items-center text-sm text-africell-primary hover:text-africell-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  {canResend ? 'Resend Code' : 'Resend available after expiry'}
                </button>
              </div>

              {/* Back Button */}
              <div className="text-center pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleGoBack}
                  className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to login
                </button>
              </div>
            </form>

            
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OTPVerification;