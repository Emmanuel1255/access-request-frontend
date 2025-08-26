import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  Download,
  MoreVertical,
  Eye,
  Edit,
  Copy,
  Trash2,
  Send,
  X,
  Calendar,
  User,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import useAuthStore from '../../store/authStore';
import useRequestStore from '../../store/requestStore';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import RequestFilters from '../../components/requests/RequestFilters';
import StatusBadge from '../../components/requests/StatusBadge';
import PriorityBadge from '../../components/requests/PriorityBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { REQUEST_STATUS } from '../../data/demoData';

const RequestList = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showActions, setShowActions] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ show: false, type: '', request: null });
  
  const navigate = useNavigate();
  const { hasPermission } = useAuthStore();
  
  const {
    requests,
    loading,
    filters,
    pagination,
    statistics,
    fetchRequests,
    setFilters,
    cancelRequest,
    duplicateRequest,
    exportRequests
  } = useRequestStore();

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests, filters]);

  const handleCreateRequest = () => {
    navigate('/requests/create');
  };

  const handleViewRequest = (request) => {
    navigate(`/requests/${request.id}`);
  };

  const handleEditRequest = (request) => {
    if (request.status === REQUEST_STATUS.DRAFT) {
      navigate(`/requests/${request.id}/edit`);
    }
  };

  const handleDuplicateRequest = async (request) => {
    try {
      const duplicated = await duplicateRequest(request.id);
      navigate(`/requests/${duplicated.id}/edit`);
    } catch (error) {
      console.error('Failed to duplicate request:', error);
    }
  };

  const handleCancelRequest = (request) => {
    setConfirmDialog({
      show: true,
      type: 'cancel',
      request,
      title: 'Cancel Request',
      message: `Are you sure you want to cancel "${request.title}"? This action cannot be undone.`,
      confirmText: 'Cancel Request'
    });
  };

  const handleConfirmAction = async () => {
    const { type, request } = confirmDialog;
    
    try {
      if (type === 'cancel') {
        await cancelRequest(request.id, 'Cancelled by user');
      }
      setConfirmDialog({ show: false, type: '', request: null });
    } catch (error) {
      console.error('Failed to perform action:', error);
    }
  };

  const handleSearch = (searchTerm) => {
    setFilters({ search: searchTerm, page: 1 });
  };

  const getActionMenuItems = (request) => {
    const items = [
      {
        label: 'View Details',
        icon: Eye,
        onClick: () => handleViewRequest(request),
        show: true
      },
      {
        label: 'Edit',
        icon: Edit,
        onClick: () => handleEditRequest(request),
        show: request.status === REQUEST_STATUS.DRAFT
      },
      {
        label: 'Duplicate',
        icon: Copy,
        onClick: () => handleDuplicateRequest(request),
        show: true
      },
      {
        label: 'Cancel',
        icon: X,
        onClick: () => handleCancelRequest(request),
        show: ['draft', 'pending'].includes(request.status) && hasPermission('cancel_request'),
        className: 'text-red-600 hover:text-red-700'
      }
    ];

    return items.filter(item => item.show);
  };

  if (loading && requests.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Requests</h1>
          <p className="text-gray-600">Manage and track your approval requests</p>
        </div>
        
        <div className="flex gap-3 items-center">
          <Button
            variant="outline"
            icon={Download}
            onClick={exportRequests}
          >
            Export
          </Button>
          
          <Button
            variant="primary"
            icon={Plus}
            onClick={handleCreateRequest}
          >
            New Request
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {Object.entries(statistics).map(([key, value]) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
          >
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-600 capitalize">{key}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 w-5 h-5 text-gray-400 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search requests..."
            value={filters.search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-africell-primary focus:border-transparent"
          />
        </div>
        
        <Button
          variant="outline"
          icon={Filter}
          onClick={() => setShowFilters(!showFilters)}
          className={showFilters ? 'ring-2 ring-africell-primary' : ''}
        >
          Filters
        </Button>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <RequestFilters
              filters={filters}
              onFiltersChange={setFilters}
              onClose={() => setShowFilters(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Request Cards */}
      <div className="space-y-4">
        {requests.map((request) => (
          <motion.div
            key={request.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border border-gray-200 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="p-6">
              {/* Request Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex gap-3 items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {request.title}
                    </h3>
                    <StatusBadge status={request.status} />
                    <PriorityBadge priority={request.priority} />
                  </div>
                  
                  <p className="mb-1 text-sm text-gray-600">
                    Request #{request.requestNumber}
                  </p>
                  
                  <div className="flex gap-4 items-center text-sm text-gray-500">
                    <div className="flex gap-1 items-center">
                      <Calendar className="w-4 h-4" />
                      <span>Created {format(new Date(request.createdAt), 'MMM dd, yyyy')}</span>
                    </div>
                    
                    {request.assignedToName && (
                      <div className="flex gap-1 items-center">
                        <User className="w-4 h-4" />
                        <span>Assigned to {request.assignedToName}</span>
                      </div>
                    )}
                    
                    {request.dueDate && (
                      <div className="flex gap-1 items-center">
                        <Clock className="w-4 h-4" />
                        <span>Due {format(new Date(request.dueDate), 'MMM dd, yyyy')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Menu */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowActions(!showActions);
                    }}
                    className="p-2 text-gray-400 rounded-lg transition-colors hover:text-gray-600 hover:bg-gray-100"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  <AnimatePresence>
                    {showActions && selectedRequest?.id === request.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 z-50 mt-2 w-48 bg-white rounded-lg border border-gray-200 shadow-lg"
                      >
                        <div className="py-1">
                          {getActionMenuItems(request).map((item, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                item.onClick();
                                setShowActions(false);
                                setSelectedRequest(null);
                              }}
                              className={`flex items-center gap-3 w-full px-4 py-2 text-sm transition-colors hover:bg-gray-50 ${
                                item.className || 'text-gray-700'
                              }`}
                            >
                              <item.icon className="w-4 h-4" />
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Request Progress */}
              {request.status === REQUEST_STATUS.PENDING && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
                    <span>Approval Progress</span>
                    <span>{request.currentApprovalLevel} of {request.totalApprovalLevels}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 rounded-full transition-all bg-africell-primary"
                      style={{ width: `${(request.currentApprovalLevel / request.totalApprovalLevels) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex gap-3 items-center">
                <Button
                  variant="outline"
                  size="sm"
                  icon={Eye}
                  onClick={() => handleViewRequest(request)}
                >
                  View Details
                </Button>
                
                {request.status === REQUEST_STATUS.DRAFT && (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Edit}
                    onClick={() => handleEditRequest(request)}
                  >
                    Edit
                  </Button>
                )}
                
                {request.status === REQUEST_STATUS.DRAFT && (
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Send}
                    onClick={() => navigate(`/requests/${request.id}/submit`)}
                  >
                    Submit
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {requests.length === 0 && !loading && (
        <div className="py-12 text-center">
          <div className="flex justify-center items-center mx-auto mb-4 w-24 h-24 bg-gray-100 rounded-full">
            <Plus className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900">No requests found</h3>
          <p className="mb-6 text-gray-500">
            {filters.search || filters.status || filters.priority 
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first request'
            }
          </p>
          <Button
            variant="primary"
            icon={Plus}
            onClick={handleCreateRequest}
          >
            Create Request
          </Button>
        </div>
      )}

      {/* Pagination */}
      {pagination.total > pagination.limit && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-700">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} results
          </p>
          
          <div className="flex gap-2 items-center">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => setFilters({ page: pagination.page - 1 })}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.pages}
              onClick={() => setFilters({ page: pagination.page + 1 })}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.show}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmDialog({ show: false, type: '', request: null })}
        variant="danger"
      />

      {/* Click outside to close actions menu */}
      {showActions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowActions(false);
            setSelectedRequest(null);
          }}
        />
      )}
    </div>
  );
};

export default RequestList;