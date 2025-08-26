import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import Button from './Button';

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'primary',
  loading = false
}) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          iconColor: 'text-red-500',
          iconBg: 'bg-red-100',
          confirmVariant: 'danger'
        };
      case 'warning':
        return {
          iconColor: 'text-yellow-500',
          iconBg: 'bg-yellow-100',
          confirmVariant: 'secondary'
        };
      default:
        return {
          iconColor: 'text-africell-primary',
          iconBg: 'bg-purple-100',
          confirmVariant: 'primary'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <AnimatePresence>
      <div className="overflow-y-auto fixed inset-0 z-50">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          // className="fixed inset-0 bg-black bg-opacity-50"
          onClick={onCancel}
        />

        {/* Dialog */}
        <div className="flex justify-center items-center p-4 min-h-screen">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-md bg-white rounded-xl shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Icon */}
              <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${styles.iconBg} mb-4`}>
                <AlertTriangle className={`h-6 w-6 ${styles.iconColor}`} />
              </div>

              {/* Content */}
              <div className="text-center">
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  {title}
                </h3>
                <p className="mb-6 text-sm text-gray-500">
                  {message}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end items-center">
                <Button
                  variant="outline"
                  onClick={onCancel}
                  disabled={loading}
                >
                  {cancelText}
                </Button>
                <Button
                  variant={styles.confirmVariant}
                  onClick={onConfirm}
                  loading={loading}
                >
                  {confirmText}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmDialog;