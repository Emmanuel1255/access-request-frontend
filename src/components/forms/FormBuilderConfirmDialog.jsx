import React from 'react';
import { motion } from 'framer-motion';
import Button from '../common/Button';

const FormBuilderConfirmDialog = ({ isOpen, title, message, confirmText, cancelText, variant, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black bg-opacity-50"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-md bg-white rounded-lg shadow-xl"
            >
                <div className="p-6">
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
                    <p className="mb-6 text-gray-600">{message}</p>
                    
                    <div className="flex gap-3 justify-end">
                        <Button variant="outline" onClick={onCancel}>
                            {cancelText}
                        </Button>
                        <Button variant={variant} onClick={onConfirm}>
                            {confirmText}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default FormBuilderConfirmDialog;