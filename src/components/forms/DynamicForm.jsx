import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import SignatureField from './SignatureField';

const DynamicForm = ({ schema, data = {}, onChange, errors = {} }) => {
    const handleFieldChange = (fieldName, value) => {
        const newData = { ...data, [fieldName]: value };
        const newErrors = { ...errors };

        // Basic validation
        const field = schema.fields?.find(f => f.name === fieldName);
        if (field) {
            // Remove error if field now has value and is required
            if (field.required && value) {
                delete newErrors[fieldName];
            }

            // Add error if field is required but empty
            if (field.required && !value) {
                newErrors[fieldName] = `${field.label} is required`;
            }

            // Type-specific validation
            if (value) {
                switch (field.type) {
                    case 'email':
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(value)) {
                            newErrors[fieldName] = 'Please enter a valid email address';
                        } else {
                            delete newErrors[fieldName];
                        }
                        break;

                    case 'number':
                        if (isNaN(value)) {
                            newErrors[fieldName] = 'Please enter a valid number';
                        } else {
                            const numValue = Number(value);
                            if (field.min !== undefined && numValue < field.min) {
                                newErrors[fieldName] = `Value must be at least ${field.min}`;
                            } else if (field.max !== undefined && numValue > field.max) {
                                newErrors[fieldName] = `Value must be at most ${field.max}`;
                            } else {
                                delete newErrors[fieldName];
                            }
                        }
                        break;

                    case 'text':
                    case 'textarea':
                        if (field.maxLength && value.length > field.maxLength) {
                            newErrors[fieldName] = `Maximum ${field.maxLength} characters allowed`;
                        } else if (field.minLength && value.length < field.minLength) {
                            newErrors[fieldName] = `Minimum ${field.minLength} characters required`;
                        } else {
                            delete newErrors[fieldName];
                        }
                        break;

                    case 'signature':
                        break;
                }
            }
        }

        onChange(newData, newErrors);
    };

    const renderField = (field) => {
        const value = data[field.name] || '';
        const error = errors[field.name];
        const isRequired = field.required;

        const baseClasses = `w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-africell-primary focus:border-transparent transition-colors ${error ? 'border-red-300' : 'border-gray-300'
            }`;

        const labelClasses = `block text-sm font-medium text-gray-700 mb-2 ${isRequired ? "after:content-['*'] after:text-red-500 after:ml-1" : ''
            }`;

        switch (field.type) {
            case 'text':
            case 'email':
                return (
                    <div key={field.name}>
                        <label className={labelClasses}>
                            {field.label}
                        </label>
                        <input
                            type={field.type}
                            value={value}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                            className={baseClasses}
                            required={isRequired}
                        />
                        {error && (
                            <div className="flex gap-1 items-center mt-1 text-sm text-red-600">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}
                    </div>
                );

            case 'number':
                return (
                    <div key={field.name}>
                        <label className={labelClasses}>
                            {field.label}
                        </label>
                        <input
                            type="number"
                            value={value}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                            min={field.min}
                            max={field.max}
                            step={field.step || 1}
                            className={baseClasses}
                            required={isRequired}
                        />
                        {field.min !== undefined && field.max !== undefined && (
                            <p className="mt-1 text-xs text-gray-500">
                                Value must be between {field.min} and {field.max}
                            </p>
                        )}
                        {error && (
                            <div className="flex gap-1 items-center mt-1 text-sm text-red-600">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}
                    </div>
                );

            case 'textarea':
                return (
                    <div key={field.name}>
                        <label className={labelClasses}>
                            {field.label}
                        </label>
                        <textarea
                            value={value}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                            rows={field.rows || 4}
                            maxLength={field.maxLength}
                            className={baseClasses}
                            required={isRequired}
                        />
                        {field.maxLength && (
                            <p className="mt-1 text-xs text-right text-gray-500">
                                {value.length}/{field.maxLength} characters
                            </p>
                        )}
                        {error && (
                            <div className="flex gap-1 items-center mt-1 text-sm text-red-600">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}
                    </div>
                );

            case 'multiselect':
                return (
                    <div key={field.name}>
                        <label className={labelClasses}>
                            {field.label}
                        </label>
                        <div className="overflow-y-auto p-3 space-y-2 max-h-40 rounded-lg border border-gray-300">
                            {field.options?.map((option) => (
                                <div key={option.value} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id={`${field.name}-${option.value}`}
                                        checked={Array.isArray(value) && value.includes(option.value)}
                                        onChange={(e) => {
                                            const currentValues = Array.isArray(value) ? value : [];
                                            const newValues = e.target.checked
                                                ? [...currentValues, option.value]
                                                : currentValues.filter(v => v !== option.value);
                                            handleFieldChange(field.name, newValues);
                                        }}
                                        className="w-4 h-4 rounded border-gray-300 text-africell-primary focus:ring-africell-primary"
                                    />
                                    <label
                                        htmlFor={`${field.name}-${option.value}`}
                                        className="ml-2 text-sm text-gray-700 cursor-pointer"
                                    >
                                        {option.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                        {error && (
                            <div className="flex gap-1 items-center mt-1 text-sm text-red-600">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}
                    </div>
                );

            case 'select':
                return (
                    <div key={field.name}>
                        <label className={labelClasses}>
                            {field.label}
                        </label>
                        <select
                            value={value}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            className={baseClasses}
                            required={isRequired}
                        >
                            <option value="">Select {field.label.toLowerCase()}</option>
                            {field.options?.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        {error && (
                            <div className="flex gap-1 items-center mt-1 text-sm text-red-600">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}
                    </div>
                );

            case 'date':
                return (
                    <div key={field.name}>
                        <label className={labelClasses}>
                            {field.label}
                        </label>
                        <input
                            type="date"
                            value={value}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            min={field.min}
                            max={field.max}
                            className={baseClasses}
                            required={isRequired}
                        />
                        {error && (
                            <div className="flex gap-1 items-center mt-1 text-sm text-red-600">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}
                    </div>
                );

            case 'checkbox':
                return (
                    <div key={field.name}>
                        <div className="flex gap-3 items-center">
                            <input
                                type="checkbox"
                                id={field.name}
                                checked={value === true || value === 'true'}
                                onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-africell-primary focus:ring-africell-primary"
                                required={isRequired}
                            />
                            <label htmlFor={field.name} className="text-sm text-gray-700">
                                {field.label}
                                {isRequired && <span className="ml-1 text-red-500">*</span>}
                            </label>
                        </div>
                        {error && (
                            <div className="flex gap-1 items-center mt-1 text-sm text-red-600">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}
                    </div>
                );

            case 'signature':
                return (
                    <div key={field.name}>
                        <SignatureField
                            label={field.label}
                            required={field.required}
                            maxWidth={field.maxWidth || 400}
                            maxHeight={field.maxHeight || 200}
                            placeholder={field.placeholder}
                        />
                    </div>
                );

            case 'file':
                return (
                    <div key={field.name}>
                        <label className={labelClasses}>
                            {field.label}
                        </label>
                        <input
                            type="file"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                handleFieldChange(field.name, file?.name || '');
                            }}
                            accept={field.accept}
                            className={baseClasses}
                            required={isRequired}
                        />
                        {field.accept && (
                            <p className="mt-1 text-xs text-gray-500">
                                Accepted formats: {field.accept}
                            </p>
                        )}
                        {error && (
                            <div className="flex gap-1 items-center mt-1 text-sm text-red-600">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    if (!schema?.fields || !Array.isArray(schema.fields)) {
        return (
            <div className="py-8 text-center">
                <AlertCircle className="mx-auto mb-2 w-8 h-8 text-gray-400" />
                <p className="text-gray-500">Invalid form schema</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {schema.fields.map((field, index) => (
                <motion.div
                    key={field.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                    {renderField(field)}
                </motion.div>
            ))}
        </div>
    );
};

export default DynamicForm;