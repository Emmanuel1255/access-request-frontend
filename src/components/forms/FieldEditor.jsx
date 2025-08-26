import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Button from '../common/Button';

const FieldEditor = ({ field, onUpdate, onClose, onDelete }) => {
    const [localField, setLocalField] = useState(field);

    useEffect(() => {
        setLocalField(field);
    }, [field]);

    const handleChange = (key, value) => {
        const updated = { ...localField, [key]: value };
        setLocalField(updated);
        onUpdate(updated);
    };

    const addOption = () => {
        const newOptions = [...(localField.options || []), { 
            value: `option${(localField.options || []).length + 1}`, 
            label: `Option ${(localField.options || []).length + 1}` 
        }];
        handleChange('options', newOptions);
    };

    const updateOption = (index, key, value) => {
        const newOptions = [...(localField.options || [])];
        newOptions[index] = { ...newOptions[index], [key]: value };
        handleChange('options', newOptions);
    };

    const removeOption = (index) => {
        const newOptions = (localField.options || []).filter((_, i) => i !== index);
        handleChange('options', newOptions);
    };

    const updateColumnSettings = (key, value) => {
        const layout = { ...localField.layout, [key]: value };
        handleChange('layout', layout);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-900">Field Settings</h3>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-400 rounded hover:text-gray-600"
                    >
                        ×
                    </button>
                </div>
            </div>

            <div className="overflow-y-auto flex-1 p-4 space-y-4">
                {/* Basic Settings */}
                <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                        Label
                    </label>
                    <input
                        type="text"
                        value={localField.label || ''}
                        onChange={(e) => handleChange('label', e.target.value)}
                        className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                        Field Name
                    </label>
                    <input
                        type="text"
                        value={localField.name || ''}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={localField.required || false}
                            onChange={(e) => handleChange('required', e.target.checked)}
                            className="mr-2"
                        />
                        <span className="text-sm font-medium text-gray-700">Required</span>
                    </label>
                </div>

                <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                        Placeholder
                    </label>
                    <input
                        type="text"
                        value={localField.placeholder || ''}
                        onChange={(e) => handleChange('placeholder', e.target.value)}
                        className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>

                {/* Layout Settings */}
                {(localField.type === 'container' || localField.type === 'columns' || localField.type === 'grid') && (
                    <div className="pt-4 border-t">
                        <h4 className="mb-3 font-medium text-gray-900">Layout Settings</h4>
                        
                        {localField.type === 'columns' && (
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                    Number of Columns
                                </label>
                                <select
                                    value={localField.layout?.columns || 2}
                                    onChange={(e) => updateColumnSettings('columns', parseInt(e.target.value))}
                                    className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value={1}>1 Column</option>
                                    <option value={2}>2 Columns</option>
                                    <option value={3}>3 Columns</option>
                                    <option value={4}>4 Columns</option>
                                </select>
                            </div>
                        )}

                        {localField.type === 'grid' && (
                            <>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block mb-1 text-sm font-medium text-gray-700">
                                            Columns
                                        </label>
                                        <select
                                            value={localField.layout?.gridColumns || 2}
                                            onChange={(e) => updateColumnSettings('gridColumns', parseInt(e.target.value))}
                                            className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        >
                                            <option value={1}>1</option>
                                            <option value={2}>2</option>
                                            <option value={3}>3</option>
                                            <option value={4}>4</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block mb-1 text-sm font-medium text-gray-700">
                                            Gap
                                        </label>
                                        <select
                                            value={localField.layout?.gap || 'md'}
                                            onChange={(e) => updateColumnSettings('gap', e.target.value)}
                                            className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        >
                                            <option value="sm">Small</option>
                                            <option value="md">Medium</option>
                                            <option value="lg">Large</option>
                                        </select>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Column Width Settings for regular fields */}
                {!['container', 'columns', 'grid'].includes(localField.type) && (
                    <div className="pt-4 border-t">
                        <h4 className="mb-3 font-medium text-gray-900">Column Settings</h4>
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">
                                Column Span
                            </label>
                            <select
                                value={localField.columnSpan || 1}
                                onChange={(e) => handleChange('columnSpan', parseInt(e.target.value))}
                                className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                                <option value={1}>1 Column</option>
                                <option value={2}>2 Columns</option>
                                <option value={3}>3 Columns</option>
                                <option value={4}>4 Columns</option>
                                <option value="full">Full Width</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Signature field settings */}
                {localField.type === 'signature' && (
                    <div className="pt-4 border-t">
                        <h4 className="mb-3 font-medium text-gray-900">Signature Settings</h4>
                        
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                    Max Width (px)
                                </label>
                                <input
                                    type="number"
                                    value={localField.maxWidth || 400}
                                    onChange={(e) => handleChange('maxWidth', parseInt(e.target.value) || 400)}
                                    className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    min="200"
                                    max="800"
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                    Max Height (px)
                                </label>
                                <input
                                    type="number"
                                    value={localField.maxHeight || 200}
                                    onChange={(e) => handleChange('maxHeight', parseInt(e.target.value) || 200)}
                                    className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    min="100"
                                    max="400"
                                />
                            </div>
                        </div>

                        <div className="mt-3">
                            <label className="block mb-1 text-sm font-medium text-gray-700">
                                Default Mode
                            </label>
                            <select
                                value={localField.signatureMode || 'draw'}
                                onChange={(e) => handleChange('signatureMode', e.target.value)}
                                className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="draw">Draw Signature</option>
                                <option value="upload">Upload Signature</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Options for select fields */}
                {(localField.type === 'select' || localField.type === 'multiselect') && (
                    <div className="pt-4 border-t">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium text-gray-900">Options</h4>
                            <Button size="sm" onClick={addOption}>
                                <Plus className="mr-1 w-3 h-3" />
                                Add
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {(localField.options || []).map((option, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={option.label}
                                        onChange={(e) => updateOption(index, 'label', e.target.value)}
                                        placeholder="Label"
                                        className="flex-1 px-2 py-1 text-sm rounded border border-gray-300"
                                    />
                                    <input
                                        type="text"
                                        value={option.value}
                                        onChange={(e) => updateOption(index, 'value', e.target.value)}
                                        placeholder="Value"
                                        className="flex-1 px-2 py-1 text-sm rounded border border-gray-300"
                                    />
                                    <button
                                        onClick={() => removeOption(index)}
                                        className="p-1 text-red-400 hover:text-red-600"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200">
                <Button
                    variant="danger"
                    onClick={onDelete}
                    className="w-full"
                >
                    <Trash2 className="mr-2 w-4 h-4" />
                    Delete Field
                </Button>
            </div>
        </div>
    );
};

export default FieldEditor;