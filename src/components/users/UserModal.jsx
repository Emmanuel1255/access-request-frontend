import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Save, User, Mail, Building, Shield } from 'lucide-react';
import useUserStore from '../../store/userStore';
import Button from '../common/Button';
import { USER_ROLES } from '../../data/demoData';

// Validation schema
const userSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  fullName: z.string().min(1, 'Full name is required'),
  role: z.enum(['admin', 'manager', 'approver', 'user'], {
    errorMap: () => ({ message: 'Please select a role' })
  }),
  department: z.string().optional(),
  phoneNumber: z.string().optional(),
  isActive: z.boolean().default(true)
});

const UserModal = ({ isOpen, user, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const { createUser, updateUser, getDepartments } = useUserStore();
  const departments = getDepartments();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: '',
      email: '',
      fullName: '',
      role: 'user',
      department: '',
      phoneNumber: '',
      isActive: true
    }
  });

  useEffect(() => {
    if (user) {
      reset({
        username: user.username || '',
        email: user.email || '',
        fullName: user.fullName || '',
        role: user.role || 'user',
        department: user.department || '',
        phoneNumber: user.phoneNumber || '',
        isActive: user.isActive ?? true
      });
    } else {
      reset({
        username: '',
        email: '',
        fullName: '',
        role: 'user',
        department: '',
        phoneNumber: '',
        isActive: true
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    
    try {
      if (user) {
        await updateUser(user.id, data);
      } else {
        await createUser(data);
      }
      onSave();
    } catch (error) {
      console.error('Failed to save user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="flex items-center justify-center min-h-screen p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {user ? 'Edit User' : 'Add New User'}
              </h2>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...register('username')}
                    type="text"
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-africell-primary focus:border-transparent ${
                      errors.username ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter username"
                    disabled={loading}
                  />
                </div>
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...register('email')}
                    type="email"
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-africell-primary focus:border-transparent ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter email address"
                    disabled={loading}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  {...register('fullName')}
                  type="text"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-africell-primary focus:border-transparent ${
                    errors.fullName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter full name"
                  disabled={loading}
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    {...register('role')}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-africell-primary focus:border-transparent ${
                      errors.role ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={loading}
                  >
                    <option value="">Select a role</option>
                    {Object.entries(USER_ROLES).map(([key, value]) => (
                      <option key={value} value={value}>
                        {key.charAt(0) + key.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    {...register('department')}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-africell-primary focus:border-transparent"
                    disabled={loading}
                  >
                    <option value="">Select department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  {...register('phoneNumber')}
                  type="tel"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-africell-primary focus:border-transparent"
                  placeholder="Enter phone number"
                  disabled={loading}
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  {...register('isActive')}
                  type="checkbox"
                  id="isActive"
                  className="h-4 w-4 text-africell-primary focus:ring-africell-primary border-gray-300 rounded"
                  disabled={loading}
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  User is active
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  icon={Save}
                >
                  {user ? 'Update User' : 'Create User'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default UserModal;