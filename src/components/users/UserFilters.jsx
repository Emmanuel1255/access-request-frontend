import React from 'react';
import { motion } from 'framer-motion';
import { X, RotateCcw } from 'lucide-react';
import useUserStore from '../../store/userStore';
import Button from '../common/Button';
import { USER_ROLES } from '../../data/demoData';

const UserFilters = ({ filters, onFiltersChange, onClose }) => {
  const { getDepartments } = useUserStore();
  const departments = getDepartments();

  const handleFilterChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value, page: 1 });
  };

  const resetFilters = () => {
    onFiltersChange({
      search: '',
      role: '',
      department: '',
      status: '',
      page: 1,
      limit: 10,
      sortBy: 'fullName',
      sortOrder: 'asc'
    });
  };

  const hasActiveFilters = filters.role || filters.department || filters.status !== '';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900">Filters</h3>
        <div className="flex items-center gap-2">
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
            className="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Role Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Role
          </label>
          <select
            value={filters.role}
            onChange={(e) => handleFilterChange('role', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-africell-primary focus:border-transparent"
          >
            <option value="">All Roles</option>
            {Object.entries(USER_ROLES).map(([key, value]) => (
              <option key={value} value={value}>
                {key.charAt(0) + key.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Department Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Department
          </label>
          <select
            value={filters.department}
            onChange={(e) => handleFilterChange('department', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-africell-primary focus:border-transparent"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-africell-primary focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Sort Options */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-africell-primary focus:border-transparent"
            >
              <option value="fullName">Name</option>
              <option value="email">Email</option>
              <option value="role">Role</option>
              <option value="department">Department</option>
              <option value="createdAt">Created Date</option>
              <option value="lastLogin">Last Login</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Sort Order
            </label>
            <select
              value={filters.sortOrder}
              onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-africell-primary focus:border-transparent"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UserFilters;