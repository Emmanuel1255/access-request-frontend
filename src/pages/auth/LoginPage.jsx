import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, LogIn } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();

  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data);
      toast.success('Login successful!');
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center px-4 py-8 min-h-screen bg-africell-primary">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo and Title */}
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex justify-center items-center mx-auto mb-4 w-20 h-20 bg-white rounded-2xl shadow-lg"
          >
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
          </motion.div>
          <h1 className="mb-2 text-3xl font-bold text-white">Welcome Back</h1>
          <p className="text-africell-light">Sign in to your Request Approval account</p>
        </div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-8 bg-white rounded-2xl shadow-2xl"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                {...register('username')}
                type="text"
                id="username"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-africell-primary focus:border-transparent transition-all ${
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
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-africell-primary focus:border-transparent transition-all pr-12 ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 text-gray-500 transform -translate-y-1/2 hover:text-gray-700"
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
              className="w-full"
              loading={loading}
              icon={LogIn}
              size="lg"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="p-4 mt-6 bg-gray-50 rounded-lg">
            <h4 className="mb-2 text-sm font-medium text-gray-700">Demo Credentials:</h4>
            <div className="space-y-1 text-xs text-gray-600">
              <div><strong>Admin:</strong> admin / password123</div>
              <div><strong>Manager:</strong> jane.smith / password123</div>
              <div><strong>User:</strong> john.doe / password123</div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-africell-light">
            Request Approval Workflow System v1.0
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;