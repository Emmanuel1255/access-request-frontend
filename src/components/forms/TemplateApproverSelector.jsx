import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  User,
  Users,
  Search,
  AlertCircle,
  CheckCircle,
  Info,
  Crown,
  UserCheck
} from 'lucide-react';
import { demoUsers } from '../../data/demoData';
import Button from '../common/Button';

const TemplateApproverSelector = ({ 
  approvers = [], 
  onChange, 
  className = '',
  showValidation = true 
}) => {
  const [selectedApprovers, setSelectedApprovers] = useState(approvers);
  const [searchTerm, setSearchTerm] = useState('');
  const [errors, setErrors] = useState({});
  const [approvalMode, setApprovalMode] = useState('sequential'); // 'sequential' or 'any'

  useEffect(() => {
    setSelectedApprovers(approvers);
  }, [approvers]);

  useEffect(() => {
    onChange({
      approvers: selectedApprovers,
      mode: approvalMode
    });
    validateApprovers(selectedApprovers);
  }, [selectedApprovers, approvalMode]);

  const validateApprovers = (currentApprovers) => {
    const newErrors = {};

    if (currentApprovers.length === 0) {
      newErrors.general = 'At least one approver must be selected for this template';
    }

    // Check for duplicate approvers
    const approverIds = currentApprovers.map(a => a.userId);
    const duplicates = approverIds.filter((id, index) => approverIds.indexOf(id) !== index);
    
    if (duplicates.length > 0) {
      newErrors.duplicates = 'Duplicate approvers are not allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getAvailableUsers = () => {
    return demoUsers.filter(user => 
      user.isActive && 
      ['admin', 'manager', 'approver'].includes(user.role) &&
      !selectedApprovers.some(approver => approver.userId === user.id) &&
      (searchTerm === '' || 
       user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       user.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       user.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const addApprover = (user) => {
    const newApprover = {
      id: Date.now(),
      userId: user.id,
      userName: user.fullName,
      userEmail: user.email,
      userRole: user.role,
      userDepartment: user.department,
      userJobTitle: user.jobTitle,
      isRequired: true,
      canDelegate: true,
      order: selectedApprovers.length + 1
    };
    
    setSelectedApprovers(prev => [...prev, newApprover]);
    setSearchTerm(''); // Clear search after adding
  };

  const removeApprover = (approverId) => {
    setSelectedApprovers(prev => {
      const newApprovers = prev.filter(approver => approver.id !== approverId);
      // Reorder remaining approvers
      return newApprovers.map((approver, index) => ({
        ...approver,
        order: index + 1
      }));
    });
  };

  const updateApprover = (approverId, field, value) => {
    setSelectedApprovers(prev => prev.map(approver => 
      approver.id === approverId ? { ...approver, [field]: value } : approver
    ));
  };

  const moveApprover = (fromIndex, toIndex) => {
    setSelectedApprovers(prev => {
      const newApprovers = [...prev];
      const [movedApprover] = newApprovers.splice(fromIndex, 1);
      newApprovers.splice(toIndex, 0, movedApprover);
      
      // Update order
      return newApprovers.map((approver, index) => ({
        ...approver,
        order: index + 1
      }));
    });
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'manager':
        return <UserCheck className="w-4 h-4 text-blue-600" />;
      case 'approver':
        return <User className="w-4 h-4 text-green-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-yellow-100 text-yellow-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'approver':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div>
        <h3 className="text-lg font-medium text-gray-900">Template Approvers</h3>
        <p className="text-sm text-gray-600">
          Define who can approve requests created from this template
        </p>
      </div>

      {/* Approval Mode Selection */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h4 className="mb-3 text-sm font-medium text-gray-900">Approval Mode</h4>
        <div className="space-y-2">
          <label className="flex gap-3 items-center">
            <input
              type="radio"
              name="approvalMode"
              value="sequential"
              checked={approvalMode === 'sequential'}
              onChange={(e) => setApprovalMode(e.target.value)}
              className="w-4 h-4 text-africell-primary focus:ring-africell-primary"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">Sequential Approval</span>
              <p className="text-xs text-gray-600">Approvers must approve in the specified order</p>
            </div>
          </label>
          <label className="flex gap-3 items-center">
            <input
              type="radio"
              name="approvalMode"
              value="any"
              checked={approvalMode === 'any'}
              onChange={(e) => setApprovalMode(e.target.value)}
              className="w-4 h-4 text-africell-primary focus:ring-africell-primary"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">Any Approver</span>
              <p className="text-xs text-gray-600">Any selected approver can approve the request</p>
            </div>
          </label>
        </div>
      </div>

      {/* General Error */}
      {showValidation && errors.general && (
        <div className="flex gap-2 items-center p-3 bg-red-50 rounded-lg border border-red-200">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-600">{errors.general}</span>
        </div>
      )}

      {/* Duplicates Error */}
      {showValidation && errors.duplicates && (
        <div className="flex gap-2 items-center p-3 bg-red-50 rounded-lg border border-red-200">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-600">{errors.duplicates}</span>
        </div>
      )}

      {/* Add Approver Section */}
      <div className="p-4 bg-white rounded-lg border border-gray-200">
        <h4 className="mb-3 text-sm font-medium text-gray-900">Add Approver</h4>
        
        {/* Search Input */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, department, or job title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="py-2 pr-4 pl-10 w-full text-sm rounded-md border border-gray-300 focus:ring-2 focus:ring-africell-primary focus:border-transparent"
          />
        </div>

        {/* Available Users List */}
        <div className="overflow-y-auto space-y-2 max-h-48">
          {getAvailableUsers().length > 0 ? (
            getAvailableUsers().map(user => (
              <div
                key={user.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg transition-colors hover:bg-gray-100"
              >
                <div className="flex gap-3 items-center">
                  <div className="flex justify-center items-center w-10 h-10 bg-gradient-to-r rounded-full from-africell-primary to-africell-secondary">
                    <span className="text-sm font-medium text-white">
                      {user.fullName?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="flex gap-2 items-center">
                      <span className="text-sm font-medium text-gray-900">{user.fullName}</span>
                      {getRoleIcon(user.role)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      {user.jobTitle} • {user.department}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  icon={Plus}
                  onClick={() => addApprover(user)}
                >
                  Add
                </Button>
              </div>
            ))
          ) : (
            <div className="py-6 text-center">
              <Users className="mx-auto mb-2 w-8 h-8 text-gray-400" />
              <p className="text-sm text-gray-600">
                {searchTerm ? 'No users found matching your search' : 'All available approvers have been added'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Selected Approvers */}
      {selectedApprovers.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">
            Selected Approvers ({selectedApprovers.length})
          </h4>
          
          <div className="space-y-3">
            {selectedApprovers.map((approver, index) => (
              <motion.div
                key={approver.id}
                layout
                className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
              >
                <div className="flex gap-4 items-start">
                  {/* Order Number (for sequential mode) */}
                  {approvalMode === 'sequential' && (
                    <div className="flex flex-col items-center">
                      <div className="flex justify-center items-center mb-2 w-8 h-8 text-sm font-medium text-white rounded-full bg-africell-primary">
                        {index + 1}
                      </div>
                      {/* Move buttons */}
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => moveApprover(index, index - 1)}
                          disabled={index === 0}
                          className="p-1 text-xs text-gray-400 disabled:opacity-30 hover:text-gray-600"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveApprover(index, index + 1)}
                          disabled={index === selectedApprovers.length - 1}
                          className="p-1 text-xs text-gray-400 disabled:opacity-30 hover:text-gray-600"
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Approver Info */}
                  <div className="flex-1">
                    <div className="flex gap-3 items-center mb-3">
                      <div className="flex justify-center items-center w-10 h-10 bg-gradient-to-r rounded-full from-africell-primary to-africell-secondary">
                        <span className="text-sm font-medium text-white">
                          {approver.userName?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="flex gap-2 items-center">
                          <span className="text-sm font-medium text-gray-900">{approver.userName}</span>
                          {getRoleIcon(approver.userRole)}
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(approver.userRole)}`}>
                            {approver.userRole}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">
                          {approver.userJobTitle} • {approver.userDepartment}
                        </p>
                        <p className="text-xs text-gray-500">{approver.userEmail}</p>
                      </div>
                    </div>

                    {/* Options */}
                    <div className="flex gap-6 items-center">
                      <div className="flex gap-2 items-center">
                        <input
                          type="checkbox"
                          id={`required_${approver.id}`}
                          checked={approver.isRequired}
                          onChange={(e) => updateApprover(approver.id, 'isRequired', e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-africell-primary focus:ring-africell-primary"
                        />
                        <label htmlFor={`required_${approver.id}`} className="text-sm text-gray-700">
                          Required approval
                        </label>
                      </div>

                      <div className="flex gap-2 items-center">
                        <input
                          type="checkbox"
                          id={`delegate_${approver.id}`}
                          checked={approver.canDelegate}
                          onChange={(e) => updateApprover(approver.id, 'canDelegate', e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-africell-primary focus:ring-africell-primary"
                        />
                        <label htmlFor={`delegate_${approver.id}`} className="text-sm text-gray-700">
                          Can delegate
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeApprover(approver.id)}
                    className="p-2 text-gray-400 rounded-lg transition-colors hover:text-red-500 hover:bg-red-50"
                    title="Remove approver"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {selectedApprovers.length === 0 && (
        <div className="py-12 text-center rounded-lg border-2 border-gray-300 border-dashed">
          <Users className="mx-auto mb-4 w-12 h-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">No approvers selected</h3>
          <p className="mb-4 text-gray-500">
            Add approvers who can approve requests created from this template
          </p>
        </div>
      )}

      {/* Summary */}
      {selectedApprovers.length > 0 && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex gap-2 items-center mb-2">
            <Info className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              Approval Configuration Summary
            </span>
          </div>
          <div className="space-y-1 text-sm text-blue-800">
            <p>Mode: <strong>{approvalMode === 'sequential' ? 'Sequential Approval' : 'Any Approver Can Approve'}</strong></p>
            <p>Total approvers: <strong>{selectedApprovers.length}</strong></p>
            <p>Required approvers: <strong>{selectedApprovers.filter(a => a.isRequired).length}</strong></p>
            <p>Can delegate: <strong>{selectedApprovers.filter(a => a.canDelegate).length}</strong></p>
            {approvalMode === 'sequential' && selectedApprovers.length > 1 && (
              <p className="mt-2 text-xs text-blue-700">
                ⚠️ In sequential mode, approvers must approve in the order shown above
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateApproverSelector;