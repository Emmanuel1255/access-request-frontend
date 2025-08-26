import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  GripVertical,
  User,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle,
  Search
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { demoUsers } from '../../data/demoData';
import Button from '../common/Button';

const ApprovalChainSelector = ({ 
  approvalChain = [], 
  onChange, 
  className = '',
  showValidation = true 
}) => {
  const [chain, setChain] = useState(approvalChain);
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setChain(approvalChain);
  }, [approvalChain]);

  useEffect(() => {
    onChange(chain);
    validateChain(chain);
  }, [chain]);

  const validateChain = (currentChain) => {
    const newErrors = {};

    if (currentChain.length === 0) {
      newErrors.general = 'At least one approver is required';
    }

    currentChain.forEach((approver, index) => {
      if (!approver.approverId) {
        newErrors[`approver_${index}`] = 'Please select an approver';
      }
      if (!approver.dueDate) {
        newErrors[`dueDate_${index}`] = 'Due date is required';
      } else {
        const dueDate = new Date(approver.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (dueDate < today) {
          newErrors[`dueDate_${index}`] = 'Due date must be in the future';
        }
      }
    });

    // Check for duplicate approvers
    const approverIds = currentChain.map(a => a.approverId).filter(Boolean);
    const duplicates = approverIds.filter((id, index) => approverIds.indexOf(id) !== index);
    
    if (duplicates.length > 0) {
      currentChain.forEach((approver, index) => {
        if (duplicates.includes(approver.approverId)) {
          newErrors[`approver_${index}`] = 'Duplicate approver selected';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addApprover = () => {
    const newApprover = {
      id: Date.now(),
      approverId: '',
      dueDate: '',
      required: true,
      order: chain.length + 1
    };
    
    setChain(prev => [...prev, newApprover]);
  };

  const removeApprover = (index) => {
    setChain(prev => {
      const newChain = prev.filter((_, i) => i !== index);
      // Reorder remaining approvers
      return newChain.map((approver, i) => ({ ...approver, order: i + 1 }));
    });
  };

  const updateApprover = (index, field, value) => {
    setChain(prev => prev.map((approver, i) => 
      i === index ? { ...approver, [field]: value } : approver
    ));
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(chain);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order numbers
    const reorderedChain = items.map((item, index) => ({
      ...item,
      order: index + 1
    }));

    setChain(reorderedChain);
  };

  const getAvailableApprovers = () => {
    return demoUsers.filter(user => 
      user.isActive && 
      ['admin', 'manager', 'approver'].includes(user.role) &&
      (searchTerm === '' || 
       user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       user.department?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const getApproverById = (id) => {
    return demoUsers.find(user => user.id === parseInt(id));
  };

  const calculateDueDate = (index) => {
    const baseDate = new Date();
    // Add index + 1 days for sequential approval
    baseDate.setDate(baseDate.getDate() + (index + 1) * 2);
    return baseDate.toISOString().split('T')[0];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Approval Chain</h3>
          <p className="text-sm text-gray-600">
            Define who needs to approve this request and in what order
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          icon={Plus}
          onClick={addApprover}
        >
          Add Approver
        </Button>
      </div>

      {/* General Error */}
      {showValidation && errors.general && (
        <div className="flex gap-2 items-center p-3 bg-red-50 rounded-lg border border-red-200">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-600">{errors.general}</span>
        </div>
      )}

      {/* Approval Chain List */}
      {chain.length > 0 ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="approval-chain">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`space-y-3 ${
                  snapshot.isDraggingOver ? 'bg-blue-50 p-2 rounded-lg' : ''
                }`}
              >
                {chain.map((approver, index) => (
                  <Draggable
                    key={approver.id}
                    draggableId={approver.id.toString()}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <motion.div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        layout
                        className={`bg-white border rounded-lg p-4 ${
                          snapshot.isDragging 
                            ? 'shadow-lg ring-2 ring-africell-primary' 
                            : 'shadow-sm border-gray-200'
                        } ${
                          showValidation && (errors[`approver_${index}`] || errors[`dueDate_${index}`])
                            ? 'border-red-300 bg-red-50'
                            : ''
                        }`}
                      >
                        <div className="flex gap-4 items-start">
                          {/* Drag Handle */}
                          <div
                            {...provided.dragHandleProps}
                            className="flex flex-col items-center mt-1"
                          >
                            <div className="flex justify-center items-center mb-2 w-8 h-8 text-sm font-medium text-white rounded-full bg-africell-primary">
                              {index + 1}
                            </div>
                            <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                          </div>

                          {/* Approver Selection */}
                          <div className="flex-1 space-y-3">
                            <div>
                              <label className="block mb-2 text-sm font-medium text-gray-700">
                                Approver {index + 1}
                              </label>
                              
                              {/* Search Input */}
                              <div className="relative mb-2">
                                <Search className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2" />
                                <input
                                  type="text"
                                  placeholder="Search approvers..."
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                                  className="py-2 pr-4 pl-10 w-full text-sm rounded-md border border-gray-300 focus:ring-2 focus:ring-africell-primary"
                                />
                              </div>

                              {/* Approver Dropdown */}
                              <select
                                value={approver.approverId}
                                onChange={(e) => updateApprover(index, 'approverId', parseInt(e.target.value) || '')}
                                className={`px-3 py-2 w-full rounded-md border focus:ring-2 focus:ring-africell-primary ${ errors[`approver_${index}`] ? 'border-red-300' : 'border-gray-300'
                                }`}
                              >
                                <option value="">Select an approver...</option>
                                {getAvailableApprovers().map(user => (
                                  <option key={user.id} value={user.id}>
                                    {user.fullName} ({user.role}) - {user.department}
                                  </option>
                                ))}
                              </select>
                              
                              {showValidation && errors[`approver_${index}`] && (
                                <p className="flex gap-1 items-center mt-1 text-sm text-red-600">
                                  <AlertCircle className="w-3 h-3" />
                                  {errors[`approver_${index}`]}
                                </p>
                              )}
                            </div>

                            {/* Selected Approver Info */}
                            {approver.approverId && (
                              <div className="p-3 bg-gray-50 rounded-lg">
                                {(() => {
                                  const selectedApprover = getApproverById(approver.approverId);
                                  return selectedApprover ? (
                                    <div className="flex gap-3 items-center">
                                      <div className="flex justify-center items-center w-10 h-10 bg-gradient-to-r rounded-full from-africell-primary to-africell-secondary">
                                        <span className="text-sm font-medium text-white">
                                          {selectedApprover.fullName?.charAt(0)?.toUpperCase()}
                                        </span>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-900">
                                          {selectedApprover.fullName}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                          {selectedApprover.jobTitle} • {selectedApprover.department}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {selectedApprover.email}
                                        </p>
                                      </div>
                                    </div>
                                  ) : null;
                                })()}
                              </div>
                            )}

                            {/* Due Date and Options */}
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                              <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                  Due Date
                                </label>
                                <input
                                  type="date"
                                  value={approver.dueDate}
                                  onChange={(e) => updateApprover(index, 'dueDate', e.target.value)}
                                  min={new Date().toISOString().split('T')[0]}
                                  className={`px-3 py-2 w-full rounded-md border focus:ring-2 focus:ring-africell-primary ${ errors[`dueDate_${index}`] ? 'border-red-300' : 'border-gray-300'
                                  }`}
                                />
                                {showValidation && errors[`dueDate_${index}`] && (
                                  <p className="flex gap-1 items-center mt-1 text-sm text-red-600">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors[`dueDate_${index}`]}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-end">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const calculatedDate = calculateDueDate(index);
                                    updateApprover(index, 'dueDate', calculatedDate);
                                  }}
                                >
                                  Auto-calculate
                                </Button>
                              </div>
                            </div>

                            {/* Options */}
                            <div className="flex gap-4 items-center">
                              <div className="flex gap-2 items-center">
                                <input
                                  type="checkbox"
                                  id={`required_${index}`}
                                  checked={approver.required !== false}
                                  onChange={(e) => updateApprover(index, 'required', e.target.checked)}
                                  className="w-4 h-4 rounded border-gray-300 text-africell-primary focus:ring-africell-primary"
                                />
                                <label htmlFor={`required_${index}`} className="text-sm text-gray-700">
                                  Required approval
                                </label>
                              </div>

                              <div className="flex gap-2 items-center">
                                <input
                                  type="checkbox"
                                  id={`notify_${index}`}
                                  checked={approver.notifyOnPending !== false}
                                  onChange={(e) => updateApprover(index, 'notifyOnPending', e.target.checked)}
                                  className="w-4 h-4 rounded border-gray-300 text-africell-primary focus:ring-africell-primary"
                                />
                                <label htmlFor={`notify_${index}`} className="text-sm text-gray-700">
                                  Email notification
                                </label>
                              </div>
                            </div>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => removeApprover(index)}
                            className="p-2 text-gray-400 rounded-lg transition-colors hover:text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Approval Flow Arrow */}
                        {index < chain.length - 1 && (
                          <div className="flex justify-center mt-4">
                            <div className="w-px h-6 bg-gray-300"></div>
                            <div className="absolute mt-2 w-2 h-2 bg-gray-300 rounded-full"></div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <div className="py-12 text-center rounded-lg border-2 border-gray-300 border-dashed">
          <User className="mx-auto mb-4 w-12 h-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">No approvers added</h3>
          <p className="mb-4 text-gray-500">
            Add approvers to create your approval workflow
          </p>
          <Button
            variant="primary"
            icon={Plus}
            onClick={addApprover}
          >
            Add First Approver
          </Button>
        </div>
      )}

      {/* Approval Summary */}
      {chain.length > 0 && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex gap-2 items-center mb-2">
            <CheckCircle className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              Approval Summary
            </span>
          </div>
          <div className="text-sm text-blue-800">
            <p>Total approvers: <strong>{chain.length}</strong></p>
            <p>Required approvals: <strong>{chain.filter(a => a.required !== false).length}</strong></p>
            <p>Estimated completion: <strong>
              {chain.length > 0 && chain[chain.length - 1].dueDate
                ? new Date(chain[chain.length - 1].dueDate).toLocaleDateString()
                : 'Not set'
              }
            </strong></p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalChainSelector;