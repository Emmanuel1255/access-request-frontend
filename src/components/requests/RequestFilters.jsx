import React from 'react';
import { motion } from 'framer-motion';
import { X, RotateCcw } from 'lucide-react';
import { REQUEST_STATUS, REQUEST_PRIORITY, demoFormTemplates, demoUsers } from '../../data/demoData';
import Button from '../common/Button';

const RequestFilters = ({ filters, onFiltersChange, onClose }) => {
  const handleFilterChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value, page: 1 });
  };

  const resetFilters = () => {
    onFiltersChange({
      search: '',
      status: '',
      priority: '',
      templateId: '',
      assignedTo: '',
      dateFrom: '',
      dateTo: '',
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  const hasActiveFilters = filters.status || filters.priority || filters.templateId || 
    filters.assignedTo || filters.dateFrom || filters.dateTo;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-gray-900">Filters</h3>
        <div className="flex gap-2 items-center">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              icon={RotateCcw}
              onClick={resetFilters}
            >
              Reset
            </Button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-gray-400 rounded-md hover:text-gray-500 hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Status Filter */}
        <div>
          <label className="block mb-1 text-xs font-medium text-gray-700">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-3 py-2 w-full text-sm rounded-md border border-gray-300 focus:ring-2 focus:ring-africell-primary focus:border-transparent"
          >
            <option value="">All Status</option>
            {Object.entries(REQUEST_STATUS).map(([key, value]) => (
              <option key={value} value={value}>
                {key.charAt(0) + key.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block mb-1 text-xs font-medium text-gray-700">
            Priority
          </label>
          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="px-3 py-2 w-full text-sm rounded-md border border-gray-300 focus:ring-2 focus:ring-africell-primary focus:border-transparent"
          >
            <option value="">All Priorities</option>
            {Object.entries(REQUEST_PRIORITY).map(([key, value]) => (
              <option key={value} value={value}>
                {key.charAt(0) + key.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Template Filter */}
        <div>
          <label className="block mb-1 text-xs font-medium text-gray-700">
            Template
          </label>
          <select
            value={filters.templateId}
            onChange={(e) => handleFilterChange('templateId', e.target.value)}
            className="px-3 py-2 w-full text-sm rounded-md border border-gray-300 focus:ring-2 focus:ring-africell-primary focus:border-transparent"
          >
            <option value="">All Templates</option>
            {demoFormTemplates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.templateName}
              </option>
            ))}
          </select>
        </div>

        {/* Assigned To Filter */}
        <div>
          <label className="block mb-1 text-xs font-medium text-gray-700">
            Assigned To
          </label>
          <select
            value={filters.assignedTo}
            onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
            className="px-3 py-2 w-full text-sm rounded-md border border-gray-300 focus:ring-2 focus:ring-africell-primary focus:border-transparent"
          >
            <option value="">All Assignees</option>
            {demoUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.fullName || user.username}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Date Range Filters */}
      <div className="pt-4 mt-4 border-t border-gray-200">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block mb-1 text-xs font-medium text-gray-700">
              From Date
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="px-3 py-2 w-full text-sm rounded-md border border-gray-300 focus:ring-2 focus:ring-africell-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block mb-1 text-xs font-medium text-gray-700">
              To Date
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="px-3 py-2 w-full text-sm rounded-md border border-gray-300 focus:ring-2 focus:ring-africell-primary focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Sort Options */}
      <div className="pt-4 mt-4 border-t border-gray-200">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block mb-1 text-xs font-medium text-gray-700">
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="px-3 py-2 w-full text-sm rounded-md border border-gray-300 focus:ring-2 focus:ring-africell-primary focus:border-transparent"
            >
              <option value="createdAt">Created Date</option>
              <option value="updatedAt">Updated Date</option>
              <option value="title">Title</option>
              <option value="status">Status</option>
              <option value="priority">Priority</option>
              <option value="dueDate">Due Date</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-xs font-medium text-gray-700">
              Sort Order
            </label>
            <select
              value={filters.sortOrder}
              onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
              className="px-3 py-2 w-full text-sm rounded-md border border-gray-300 focus:ring-2 focus:ring-africell-primary focus:border-transparent"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RequestFilters;