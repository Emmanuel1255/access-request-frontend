import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Camera, 
  Save,
  Lock,
  Bell,
  Upload,
  Pen,
  Trash2,
  Download,
  RotateCcw,
  PenTool,
  CheckCircle
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

// Validation schema
const profileSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().optional(),
  department: z.string().optional(),
});

// Signature Field Component
const SignatureField = ({ 
  label, 
  required = false, 
  value, 
  onChange, 
  maxWidth = 400,
  maxHeight = 150,
  disabled = false 
}) => {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureMode, setSignatureMode] = useState('draw');
  const [canvasInitialized, setCanvasInitialized] = useState(false);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && !canvasInitialized) {
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      canvas.width = maxWidth;
      canvas.height = maxHeight;
      
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      setCanvasInitialized(true);
    }
  }, [maxWidth, maxHeight, canvasInitialized]);

  // Load existing signature if provided
  useEffect(() => {
    if (value && canvasInitialized) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = value;
    }
  }, [value, canvasInitialized]);

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const getTouchPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const touch = e.touches[0];
    return {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    if (disabled || signatureMode !== 'draw') return;
    
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = e.type.includes('touch') ? getTouchPos(e) : getMousePos(e);
    
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    
    e.preventDefault();
  };

  const draw = (e) => {
    if (!isDrawing || disabled || signatureMode !== 'draw') return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = e.type.includes('touch') ? getTouchPos(e) : getMousePos(e);
    
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    
    e.preventDefault();
  };

  const stopDrawing = (e) => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas || !canvasInitialized) return;
    
    const signatureData = canvas.toDataURL('image/png');
    
    if (onChange) {
      onChange(signatureData);
    }
    
    e.preventDefault();
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !canvasInitialized) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (onChange) {
      onChange(null);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        const newWidth = img.width * scale;
        const newHeight = img.height * scale;
        const x = (canvas.width - newWidth) / 2;
        const y = (canvas.height - newHeight) / 2;
        
        ctx.drawImage(img, x, y, newWidth, newHeight);
        
        const signatureData = canvas.toDataURL('image/png');
        
        if (onChange) {
          onChange(signatureData);
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    
    e.target.value = '';
  };

  const downloadSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !canvasInitialized) return;
    
    const link = document.createElement('a');
    link.download = 'signature.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const isEmpty = () => {
    const canvas = canvasRef.current;
    if (!canvas || !canvasInitialized) return true;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return true;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
      const a = imageData.data[i + 3];
      
      if (a > 0 && (r !== 255 || g !== 255 || b !== 255)) {
        return false;
      }
    }
    return true;
  };

  return (
    <div className="signature-field">
      <label className="block mb-3 text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <div className="flex gap-2 mb-4">
        <Button
          variant={signatureMode === 'draw' ? 'primary' : 'outline'}
          size="sm"
          icon={Pen}
          onClick={() => setSignatureMode('draw')}
          disabled={disabled}
        >
          Draw
        </Button>
        <Button
          variant={signatureMode === 'upload' ? 'primary' : 'outline'}
          size="sm"
          icon={Upload}
          onClick={() => {
            setSignatureMode('upload');
            fileInputRef.current?.click();
          }}
          disabled={disabled}
        >
          Upload
        </Button>
      </div>

      <div className="relative border-2 border-dashed border-gray-300 rounded-lg bg-white">
        <canvas
          ref={canvasRef}
          className={`w-full rounded-lg ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          } ${signatureMode === 'draw' ? 'cursor-crosshair' : 'cursor-pointer'}`}
          style={{ 
            maxWidth: `${maxWidth}px`, 
            height: `${maxHeight}px` 
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          onClick={() => {
            if (signatureMode === 'upload') {
              fileInputRef.current?.click();
            }
          }}
        />
        
        {canvasInitialized && isEmpty() && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <PenTool className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">
                {signatureMode === 'draw' 
                  ? 'Draw your signature here' 
                  : 'Click to upload signature image'
                }
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-3">
        <Button
          variant="outline"
          size="sm"
          icon={RotateCcw}
          onClick={clearSignature}
          disabled={disabled || !canvasInitialized || isEmpty()}
        >
          Clear
        </Button>
        <Button
          variant="ghost"
          size="sm"
          icon={Download}
          onClick={downloadSignature}
          disabled={disabled || !canvasInitialized || isEmpty()}
        >
          Download
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
        disabled={disabled}
      />

      <p className="mt-2 text-xs text-gray-500">
        {signatureMode === 'draw' 
          ? 'Use your mouse or finger to draw your signature. This will be used for approvals.'
          : 'Upload an image file (PNG, JPG, etc.) containing your signature'
        }
      </p>
    </div>
  );
};

const ProfileSettings = () => {
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [signatureLoading, setSignatureLoading] = useState(false);
  const [signatureValue, setSignatureValue] = useState(null);
  const { user, updateProfile, uploadAvatar } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      department: user?.department || '',
    }
  });

  // Initialize signature from user data
  useEffect(() => {
    if (user?.signatureUrl) {
      setSignatureValue(user.signatureUrl);
    }
  }, [user?.signatureUrl]);

  const onSubmit = async (data) => {
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updateData = { ...data };
      if (signatureValue) {
        updateData.signatureUrl = signatureValue;
      }
      
      updateProfile(updateData);
      toast.success('Profile updated successfully');
      reset(data);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    setAvatarLoading(true);
    
    try {
      await uploadAvatar(file);
      toast.success('Profile picture updated');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleSignatureSave = async () => {
    if (!signatureValue) {
      toast.error('Please create a signature first');
      return;
    }

    setSignatureLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      updateProfile({ signatureUrl: signatureValue });
      toast.success('Signature saved successfully');
    } catch (error) {
      toast.error('Failed to save signature');
    } finally {
      setSignatureLoading(false);
    }
  };

  const handleSignatureChange = (newSignature) => {
    setSignatureValue(newSignature);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account information, signature, and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Picture Section */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h2>
            
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-africell-primary to-africell-secondary flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    user?.fullName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase()
                  )}
                </div>
                
                {avatarLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                    <LoadingSpinner color="white" size="md" />
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <label htmlFor="avatar-upload" className="cursor-pointer">
                  <Button
                    as="span"
                    variant="outline"
                    icon={Camera}
                    disabled={avatarLoading}
                    className="w-full"
                  >
                    Change Picture
                  </Button>
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                
                <p className="text-xs text-gray-500">
                  JPG, PNG or GIF. Max size 2MB.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Account Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Username</label>
                <p className="text-sm text-gray-900 font-mono bg-gray-50 px-3 py-2 rounded mt-1">
                  {user?.username}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Role</label>
                <p className="text-sm text-gray-900 mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-africell-100 text-africell-600">
                    {user?.role?.toUpperCase()}
                  </span>
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Member Since</label>
                <p className="text-sm text-gray-900 mt-1">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Signature Status</label>
                <p className="text-sm mt-1">
                  {user?.signatureUrl ? (
                    <span className="inline-flex items-center text-green-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Signature saved
                    </span>
                  ) : (
                    <span className="text-amber-600">No signature saved</span>
                  )}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h2>
            
            <div className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...register('fullName')}
                    type="text"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-africell-primary focus:border-transparent ${
                      errors.fullName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                    disabled={loading}
                  />
                </div>
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
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
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-africell-primary focus:border-transparent ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your email"
                    disabled={loading}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...register('phoneNumber')}
                    type="tel"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-africell-primary focus:border-transparent"
                    placeholder="Enter your phone number"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...register('department')}
                    type="text"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-africell-primary focus:border-transparent"
                    placeholder="Enter your department"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => reset()}
                  disabled={loading || !isDirty}
                >
                  Reset Changes
                </Button>
                <Button
                  onClick={handleSubmit(onSubmit)}
                  variant="primary"
                  loading={loading}
                  disabled={!isDirty}
                  icon={Save}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Signature Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Digital Signature</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Create and save your digital signature for approvals
                </p>
              </div>
              {user?.signatureUrl && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Signature Saved
                </span>
              )}
            </div>
            
            <SignatureField
              label="Your Signature"
              value={signatureValue}
              onChange={handleSignatureChange}
              maxWidth={500}
              maxHeight={180}
              disabled={signatureLoading}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-6">
              <Button
                variant="outline"
                onClick={() => setSignatureValue(null)}
                disabled={!signatureValue || signatureLoading}
                icon={Trash2}
              >
                Clear Signature
              </Button>
              <Button
                variant="primary"
                onClick={handleSignatureSave}
                loading={signatureLoading}
                disabled={!signatureValue}
                icon={Save}
              >
                Save Signature
              </Button>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                icon={Lock}
                className="justify-start"
                onClick={() => toast.info('Password change functionality coming soon')}
              >
                Change Password
              </Button>
              
              <Button
                variant="outline"
                icon={Bell}
                className="justify-start"
                onClick={() => toast.info('Notification preferences coming soon')}
              >
                Notification Settings
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;