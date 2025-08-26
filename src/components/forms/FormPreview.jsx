import React from 'react';
import { motion } from 'framer-motion';
import Button from '../common/Button';
import SignatureField from './SignatureField';

const FormPreview = ({ isOpen, schema, onClose }) => {
    if (!isOpen) return null;

    const renderField = (field, index) => {
        const baseClasses = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500";
        
        switch (field.type) {
            case 'container':
                return (
                    <div key={index} className="p-4 rounded-lg border-2 border-gray-300 border-dashed">
                        <h3 className="mb-4 text-lg font-medium">{field.label}</h3>
                        {field.children && field.children.map((child, childIndex) => 
                            renderField(child, `${index}-${childIndex}`)
                        )}
                    </div>
                );
            
            case 'columns':
                const columns = field.layout?.columns || 2;
                return (
                    <div key={index} className={`grid gap-4 grid-cols-${columns}`}>
                        {field.children && field.children.map((child, childIndex) => (
                            <div key={`${index}-${childIndex}`}>
                                {renderField(child, `${index}-${childIndex}`)}
                            </div>
                        ))}
                    </div>
                );
            
            case 'grid':
                const gridCols = field.layout?.gridColumns || 2;
                const gap = field.layout?.gap || 'md';
                const gapClass = {
                    sm: 'gap-2',
                    md: 'gap-4',
                    lg: 'gap-6'
                }[gap];
                
                return (
                    <div key={index} className={`grid grid-cols-${gridCols} ${gapClass}`}>
                        {field.children && field.children.map((child, childIndex) => {
                            const colSpan = child.columnSpan === 'full' ? gridCols : (child.columnSpan || 1);
                            return (
                                <div key={`${index}-${childIndex}`} className={`col-span-${colSpan}`}>
                                    {renderField(child, `${index}-${childIndex}`)}
                                </div>
                            );
                        })}
                    </div>
                );
            
            case 'text':
            case 'email':
                return (
                    <div key={index} className="mb-4">
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                            {field.label}
                            {field.required && <span className="ml-1 text-red-500">*</span>}
                        </label>
                        <input
                            type={field.type}
                            placeholder={field.placeholder}
                            className={baseClasses}
                        />
                    </div>
                );
            
            case 'textarea':
                return (
                    <div key={index} className="mb-4">
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                            {field.label}
                            {field.required && <span className="ml-1 text-red-500">*</span>}
                        </label>
                        <textarea
                            placeholder={field.placeholder}
                            rows={4}
                            className={baseClasses}
                        />
                    </div>
                );
            
            case 'select':
                return (
                    <div key={index} className="mb-4">
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                            {field.label}
                            {field.required && <span className="ml-1 text-red-500">*</span>}
                        </label>
                        <select className={baseClasses}>
                            <option value="">Select an option</option>
                            {field.options?.map((option, optIndex) => (
                                <option key={optIndex} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                );

            case 'multiselect':
                return (
                    <div key={index} className="mb-4">
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                            {field.label}
                            {field.required && <span className="ml-1 text-red-500">*</span>}
                        </label>
                        <div className="border border-gray-300 rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
                            {field.options?.map((option, optIndex) => (
                                <div key={optIndex} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id={`${field.name}-${option.value}`}
                                        className="mr-2"
                                    />
                                    <label htmlFor={`${field.name}-${option.value}`} className="text-sm text-gray-700 cursor-pointer">
                                        {option.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            
            case 'checkbox':
                return (
                    <div key={index} className="mb-4">
                        <label className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            <span className="text-sm text-gray-700">
                                {field.label}
                                {field.required && <span className="ml-1 text-red-500">*</span>}
                            </span>
                        </label>
                    </div>
                );

            case 'date':
                return (
                    <div key={index} className="mb-4">
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                            {field.label}
                            {field.required && <span className="ml-1 text-red-500">*</span>}
                        </label>
                        <input
                            type="date"
                            className={baseClasses}
                        />
                    </div>
                );

            case 'file':
                return (
                    <div key={index} className="mb-4">
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                            {field.label}
                            {field.required && <span className="ml-1 text-red-500">*</span>}
                        </label>
                        <input
                            type="file"
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                    </div>
                );

            case 'signature':
                return (
                    <div key={index} className="mb-4">
                        <SignatureField
                            label={field.label}
                            required={field.required}
                            maxWidth={field.maxWidth || 400}
                            maxHeight={field.maxHeight || 200}
                            placeholder={field.placeholder}
                        />
                    </div>
                );
            
            default:
                return (
                    <div key={index} className="mb-4">
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                            {field.label}
                            {field.required && <span className="ml-1 text-red-500">*</span>}
                        </label>
                        <input
                            type={field.type}
                            placeholder={field.placeholder}
                            className={baseClasses}
                        />
                    </div>
                );
        }
    };

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
                className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Form Preview</h2>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-400 rounded hover:text-gray-600"
                    >
                        ×
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    <form className="space-y-6">
                        {schema.fields?.map((field, index) => renderField(field, index))}
                        
                        <div className="pt-4">
                            <Button type="button" className="w-full">
                                Submit Form
                            </Button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default FormPreview;