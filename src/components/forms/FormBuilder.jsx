import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
    Plus,
    Type,
    Hash,
    Mail,
    Calendar,
    List,
    CheckSquare,
    FileText,
    Upload,
    Eye,
    Settings,
    Columns,
    Grid3X3,
    Container,
    Trash2,
    GripVertical,
    PenTool
} from 'lucide-react';
import Button from '../common/Button';
import FieldEditor from './FieldEditor';
import FormPreview from './FormPreview';
import FormBuilderConfirmDialog from './FormBuilderConfirmDialog';

const FIELD_TYPES = {
    text: { icon: Type, label: 'Text Input', color: 'bg-blue-100 text-blue-600' },
    number: { icon: Hash, label: 'Number', color: 'bg-green-100 text-green-600' },
    email: { icon: Mail, label: 'Email', color: 'bg-purple-100 text-purple-600' },
    date: { icon: Calendar, label: 'Date', color: 'bg-orange-100 text-orange-600' },
    select: { icon: List, label: 'Dropdown', color: 'bg-yellow-100 text-yellow-600' },
    multiselect: { icon: CheckSquare, label: 'Multi-Select', color: 'bg-pink-100 text-pink-600' },
    textarea: { icon: FileText, label: 'Text Area', color: 'bg-indigo-100 text-indigo-600' },
    checkbox: { icon: CheckSquare, label: 'Checkbox', color: 'bg-red-100 text-red-600' },
    file: { icon: Upload, label: 'File Upload', color: 'bg-teal-100 text-teal-600' },
    signature: { icon: PenTool, label: 'Signature', color: 'bg-violet-100 text-violet-600' }
};

const LAYOUT_TYPES = {
    container: { icon: Container, label: 'Container', color: 'bg-slate-100 text-slate-600' },
    columns: { icon: Columns, label: 'Columns', color: 'bg-emerald-100 text-emerald-600' },
    grid: { icon: Grid3X3, label: 'Grid Layout', color: 'bg-cyan-100 text-cyan-600' }
};

const FormBuilder = ({ schema = {}, onChange, initialFields = [] }) => {
    const [fields, setFields] = useState([]);
    const [selectedField, setSelectedField] = useState(null);
    const [showFieldEditor, setShowFieldEditor] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, fieldId: null, fieldLabel: '' });
    const [currentContainer, setCurrentContainer] = useState(null);
    const nextId = useRef(Date.now());
    const [isInitialized, setIsInitialized] = useState(false);

    // CRITICAL: Initialize fields only once and properly
    useEffect(() => {
        console.log('=== FormBuilder Initialization ===');
        console.log('Schema:', schema);
        console.log('InitialFields:', initialFields);
        console.log('IsInitialized:', isInitialized);

        // Don't re-initialize if we already have
        if (isInitialized) {
            console.log('Already initialized, skipping...');
            return;
        }

        // Determine which fields to use - prioritize schema.fields, then initialFields
        let fieldsToUse = [];
        
        if (schema?.fields && Array.isArray(schema.fields) && schema.fields.length > 0) {
            fieldsToUse = schema.fields;
            console.log('Using schema.fields:', fieldsToUse.length, 'fields');
        } else if (Array.isArray(initialFields) && initialFields.length > 0) {
            fieldsToUse = initialFields;
            console.log('Using initialFields:', fieldsToUse.length, 'fields');
        } else {
            console.log('No fields to initialize');
            setIsInitialized(true);
            return;
        }

        // Add IDs to fields if they don't have them
        const fieldsWithIds = fieldsToUse.map((field, index) => {
            const processedField = {
                ...field,
                id: field.id || `field_${Date.now()}_${index}`,
                name: field.name || `${field.type}_${index}`
            };
            console.log(`Processing field ${index}:`, processedField.label, processedField.type);
            return processedField;
        });

        console.log('Setting fields with IDs:', fieldsWithIds.length, 'fields');
        setFields(fieldsWithIds);
        setIsInitialized(true);
        
        // Notify parent immediately
        if (onChange) {
            console.log('Notifying parent of initial fields');
            onChange({ fields: fieldsWithIds });
        }
    }, [schema, initialFields, isInitialized, onChange]);

    // Reset initialization when schema/initialFields change significantly
    useEffect(() => {
        const currentFieldCount = fields.length;
        const newFieldCount = schema?.fields?.length || initialFields?.length || 0;
        
        // If field count changed significantly, allow re-initialization
        if (isInitialized && Math.abs(currentFieldCount - newFieldCount) > 0 && newFieldCount > 0) {
            console.log('Field count changed, allowing re-initialization');
            setIsInitialized(false);
        }
    }, [schema?.fields?.length, initialFields?.length, fields.length, isInitialized]);

    // Notify parent when fields change (but not during initialization)
    useEffect(() => {
        if (isInitialized && onChange) {
            console.log('Fields changed, notifying parent:', fields.length, 'fields');
            onChange({ fields });
        }
    }, [fields, onChange, isInitialized]);

    const generateFieldId = () => {
        return `field_${nextId.current++}`;
    };

    const getDefaultFieldProps = (type) => {
        switch (type) {
            case 'container':
                return { children: [], layout: { padding: 'md' } };
            case 'columns':
                return { children: [], layout: { columns: 2, gap: 'md' } };
            case 'grid':
                return { children: [], layout: { gridColumns: 2, gap: 'md' } };
            case 'text':
            case 'textarea':
                return { maxLength: 255, columnSpan: 1 };
            case 'number':
                return { min: 0, max: 1000, step: 1, columnSpan: 1 };
            case 'select':
            case 'multiselect':
                return { options: [{ value: 'option1', label: 'Option 1' }], columnSpan: 1 };
            case 'file':
                return { accept: '*/*', maxSize: '10MB', columnSpan: 1 };
            case 'date':
                return { min: '', max: '', columnSpan: 1 };
            case 'signature':
                return { 
                    maxWidth: 400, 
                    maxHeight: 200, 
                    signatureMode: 'draw',
                    columnSpan: 1 
                };
            default:
                return { columnSpan: 1 };
        }
    };

    const createNewField = (type) => {
        const isLayoutType = ['container', 'columns', 'grid'].includes(type);
        const newField = {
            id: generateFieldId(),
            name: `${type}_${Date.now()}`,
            type,
            label: `New ${(FIELD_TYPES[type] || LAYOUT_TYPES[type])?.label}`,
            required: false,
            placeholder: '',
            ...getDefaultFieldProps(type)
        };

        if (currentContainer) {
            // Add to current container
            updateContainerChildren(currentContainer.id, [...(currentContainer.children || []), newField]);
        } else {
            // Add to root level
            const updatedFields = [...fields, newField];
            setFields(updatedFields);
        }

        setSelectedField(newField);
        setShowFieldEditor(true);
    };

    const updateContainerChildren = (containerId, children) => {
        const updateFieldRecursively = (fieldList) => {
            return fieldList.map(field => {
                if (field.id === containerId) {
                    return { ...field, children };
                } else if (field.children) {
                    return { ...field, children: updateFieldRecursively(field.children) };
                }
                return field;
            });
        };

        setFields(prev => updateFieldRecursively(prev));
    };

    const updateField = (fieldId, updates) => {
        const updateFieldRecursively = (fieldList) => {
            return fieldList.map(field => {
                if (field.id === fieldId) {
                    const updated = { ...field, ...updates };
                    if (selectedField?.id === fieldId) {
                        setSelectedField(updated);
                    }
                    return updated;
                } else if (field.children) {
                    return { ...field, children: updateFieldRecursively(field.children) };
                }
                return field;
            });
        };

        setFields(prev => updateFieldRecursively(prev));
    };

    const deleteField = (fieldId) => {
        const deleteFieldRecursively = (fieldList) => {
            return fieldList.filter(field => {
                if (field.id === fieldId) {
                    return false;
                } else if (field.children) {
                    field.children = deleteFieldRecursively(field.children);
                }
                return true;
            });
        };

        setFields(prev => deleteFieldRecursively(prev));

        if (selectedField?.id === fieldId) {
            setSelectedField(null);
            setShowFieldEditor(false);
        }

        setDeleteConfirm({ isOpen: false, fieldId: null, fieldLabel: '' });
    };

    const handleDeleteClick = (fieldId, fieldLabel) => {
        setDeleteConfirm({ isOpen: true, fieldId, fieldLabel });
    };

    const handleFieldSelect = (field) => {
        setSelectedField(field);
        setShowFieldEditor(true);
        
        // Set current container if it's a layout type
        if (['container', 'columns', 'grid'].includes(field.type)) {
            setCurrentContainer(field);
        }
    };

    const handleDragEnd = (result) => {
        if (!result.destination) {
            return;
        }

        const { source, destination } = result;
        
        // If dropped in the same position, do nothing
        if (source.index === destination.index) {
            return;
        }

        // Reorder fields
        const newFields = Array.from(fields);
        const [reorderedField] = newFields.splice(source.index, 1);
        newFields.splice(destination.index, 0, reorderedField);

        console.log('Fields reordered:', newFields.map(f => f.label));
        setFields(newFields);
    };

    const renderFieldItem = (field, index, level = 0) => {
        const isLayoutType = ['container', 'columns', 'grid'].includes(field.type);
        const fieldConfig = FIELD_TYPES[field.type] || LAYOUT_TYPES[field.type];

        return (
            <Draggable key={field.id} draggableId={field.id} index={index}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`ml-${level * 4} ${snapshot.isDragging ? 'z-50' : ''}`}
                    >
                        <motion.div
                            className={`group relative bg-white border rounded-lg p-4 transition-all cursor-pointer mb-2 ${
                                selectedField?.id === field.id
                                    ? 'ring-2 ring-blue-500 border-blue-500'
                                    : 'border-gray-200 hover:shadow-sm'
                            } ${isLayoutType ? 'border-dashed' : ''} ${
                                snapshot.isDragging ? 'shadow-lg rotate-2 scale-105' : ''
                            }`}
                            onClick={() => handleFieldSelect(field)}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex gap-2 items-center">
                                    {/* Drag Handle */}
                                    <div
                                        {...provided.dragHandleProps}
                                        className="p-1 text-gray-400 rounded hover:text-gray-600 hover:bg-gray-100 cursor-grab active:cursor-grabbing"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <GripVertical className="w-4 h-4" />
                                    </div>
                                    
                                    <div className={`w-6 h-6 rounded flex items-center justify-center ${fieldConfig?.color || 'bg-gray-100 text-gray-500'}`}>
                                        {React.createElement(fieldConfig?.icon || Type, { className: 'w-3 h-3' })}
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">
                                        {field.label}
                                    </span>
                                    {field.required && (
                                        <span className="text-xs text-red-500">Required</span>
                                    )}
                                    {isLayoutType && (
                                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded">
                                            Layout
                                        </span>
                                    )}
                                </div>

                                <div className="flex gap-1 items-center opacity-0 transition-opacity group-hover:opacity-100">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleFieldSelect(field);
                                        }}
                                        className="p-1 text-gray-400 rounded hover:text-gray-600"
                                        title="Edit field"
                                    >
                                        <Settings className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteClick(field.id, field.label);
                                        }}
                                        className="p-1 text-gray-400 rounded hover:text-red-600"
                                        title="Delete field"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="text-xs text-gray-500">
                                {field.type}
                                {field.layout?.columns && ` • ${field.layout.columns} columns`}
                                {field.options && ` • ${field.options.length} options`}
                                {field.columnSpan && field.columnSpan !== 1 && ` • spans ${field.columnSpan} columns`}
                            </div>

                            {isLayoutType && currentContainer?.id === field.id && (
                                <div className="px-2 py-1 mt-2 text-xs text-blue-600 bg-blue-50 rounded">
                                    Active container - new fields will be added here
                                </div>
                            )}
                        </motion.div>

                        {/* Render children if they exist */}
                        {field.children && field.children.length > 0 && (
                            <div className="pl-4 ml-4 border-l-2 border-gray-200">
                                {field.children.map((child, childIndex) => 
                                    renderFieldItem(child, childIndex, level + 1)
                                )}
                            </div>
                        )}
                    </div>
                )}
            </Draggable>
        );
    };

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex h-screen bg-gray-50">
                {/* Field Types Palette */}
                <div className="overflow-y-auto p-4 w-64 bg-white border-r border-gray-200">
                    <h3 className="mb-4 text-sm font-medium text-gray-900">Form Fields</h3>
                    <div className="mb-6 space-y-2">
                        {Object.entries(FIELD_TYPES).map(([type, config]) => {
                            const Icon = config.icon;
                            return (
                                <motion.button
                                    key={type}
                                    onClick={() => createNewField(type)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex gap-3 items-center p-3 w-full text-left bg-white rounded-lg border border-gray-200 transition-all hover:shadow-sm"
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.color}`}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">{config.label}</span>
                                </motion.button>
                            );
                        })}
                    </div>

                    <h3 className="mb-4 text-sm font-medium text-gray-900">Layout Elements</h3>
                    <div className="space-y-2">
                        {Object.entries(LAYOUT_TYPES).map(([type, config]) => {
                            const Icon = config.icon;
                            return (
                                <motion.button
                                    key={type}
                                    onClick={() => createNewField(type)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex gap-3 items-center p-3 w-full text-left bg-white rounded-lg border border-gray-200 border-dashed transition-all hover:shadow-sm"
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.color}`}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">{config.label}</span>
                                </motion.button>
                            );
                        })}
                    </div>

                    {currentContainer && (
                        <div className="p-3 mt-6 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex gap-2 items-center mb-2">
                                <Container className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-900">Active Container</span>
                            </div>
                            <p className="mb-2 text-xs text-blue-700">{currentContainer.label}</p>
                            <button
                                onClick={() => setCurrentContainer(null)}
                                className="text-xs text-blue-600 underline hover:text-blue-800"
                            >
                                Exit container
                            </button>
                        </div>
                    )}
                </div>

                {/* Form Canvas */}
                <div className="flex flex-col flex-1">
                    {/* Toolbar */}
                    <div className="p-4 bg-white border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Form Builder ({fields.length} fields)
                            </h2>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    icon={Eye}
                                    onClick={() => setShowPreview(true)}
                                    disabled={fields.length === 0}
                                >
                                    Preview
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const json = JSON.stringify({ fields }, null, 2);
                                        navigator.clipboard.writeText(json);
                                        alert('JSON copied to clipboard!');
                                    }}
                                    disabled={fields.length === 0}
                                >
                                    Export JSON
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Canvas Area */}
                    <div className="overflow-auto flex-1 p-6">
                        {fields.length === 0 ? (
                            <div className="py-12 text-center">
                                <Plus className="mx-auto mb-4 w-12 h-12 text-gray-300" />
                                <h3 className="mb-2 text-lg font-medium text-gray-900">No fields yet</h3>
                                <p className="mb-4 text-gray-500">
                                    Click on field types from the left panel to start building your form
                                </p>
                                <p className="text-sm text-gray-400">
                                    Use layout elements like containers, columns, and grids to organize your fields
                                </p>
                            </div>
                        ) : (
                            <Droppable droppableId="form-fields">
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={`space-y-4 min-h-[200px] ${
                                            snapshot.isDraggingOver ? 'bg-blue-50 rounded-lg border-2 border-blue-200 border-dashed' : ''
                                        }`}
                                    >
                                        {fields.map((field, index) => renderFieldItem(field, index))}
                                        {provided.placeholder}
                                        
                                        {/* Drop zone indicator */}
                                        {snapshot.isDraggingOver && (
                                            <div className="p-8 text-center text-blue-600 bg-blue-50 rounded-lg border-2 border-blue-200 border-dashed">
                                                <Plus className="mx-auto mb-2 w-8 h-8" />
                                                <p className="text-sm font-medium">Drop field here to reorder</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Droppable>
                        )}
                    </div>
                </div>

                {/* Field Editor Panel */}
                <AnimatePresence>
                    {showFieldEditor && selectedField && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 320, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            className="overflow-hidden bg-white border-l border-gray-200"
                        >
                            <FieldEditor
                                field={selectedField}
                                onUpdate={(updates) => updateField(selectedField.id, updates)}
                                onClose={() => {
                                    setShowFieldEditor(false);
                                    setSelectedField(null);
                                }}
                                onDelete={() => {
                                    handleDeleteClick(selectedField.id, selectedField.label);
                                }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Form Preview Modal */}
                <FormPreview
                    isOpen={showPreview}
                    schema={{ fields }}
                    onClose={() => setShowPreview(false)}
                />

                {/* Delete Confirmation Dialog */}
                <FormBuilderConfirmDialog
                    isOpen={deleteConfirm.isOpen}
                    title="Delete Field"
                    message={`Are you sure you want to delete the field "${deleteConfirm.fieldLabel}"? This action cannot be undone.`}
                    confirmText="Delete"
                    cancelText="Cancel"
                    variant="danger"
                    onConfirm={() => deleteField(deleteConfirm.fieldId)}
                    onCancel={() => setDeleteConfirm({ isOpen: false, fieldId: null, fieldLabel: '' })}
                />
            </div>
        </DragDropContext>
    );
};

export default FormBuilder;