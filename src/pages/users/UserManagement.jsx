import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Download,
  Upload,
  Shield
} from 'lucide-react';
import { format } from 'date-fns';
import useAuthStore from '../../store/authStore';
import useUserStore from '../../store/userStore';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import UserModal from '../../components/users/UserModal';
import UserFilters from '../../components/users/UserFilters';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const UserManagement = () => {
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { hasPermission } = useAuthStore();
  const {
    users,
    loading,
    filters,
    pagination,
    fetchUsers,
    updateUser,
    deleteUser,
    setFilters,
    exportUsers,
    syncWithAD
  } = useUserStore();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, filters]);

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setShowConfirmDialog(true);
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      await deleteUser(userToDelete.id);
      setShowConfirmDialog(false);
      setUserToDelete(null);
    }
  };

  const handleToggleStatus = async (user) => {
    await updateUser(user.id, { isActive: !user.isActive });
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setFilters({ search: e.target.value });
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'approver':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage system users and their permissions</p>
        </div>
        
        <div className="flex items-center gap-3">
          {hasPermission('sync_ad') && (
            <Button
              variant="outline"
              icon={Upload}
              onClick={syncWithAD}
              loading={loading}
            >
              Sync with AD
            </Button>
          )}
          
          <Button
            variant="outline"
            icon={Download}
            onClick={exportUsers}
          >
            Export
          </Button>
          
          {hasPermission('create_user') && (
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => {
                setSelectedUser(null);
                setShowUserModal(true);
              }}
            >
              Add User
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={handleSearch}
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
            <UserFilters
              filters={filters}
              onFiltersChange={setFilters}
              onClose={() => setShowFilters(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-africell-primary to-africell-secondary flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {user.fullName?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.fullName || user.username}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                      {user.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                      {user.role?.toUpperCase()}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.department || '-'}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin 
                      ? format(new Date(user.lastLogin), 'MMM dd, yyyy')
                      : 'Never'
                    }
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {hasPermission('edit_user') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Edit}
                          onClick={() => handleEditUser(user)}
                        >
                          Edit
                        </Button>
                      )}
                      
                      {hasPermission('manage_user_status') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={user.isActive ? UserX : UserCheck}
                          onClick={() => handleToggleStatus(user)}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      )}
                      
                      {hasPermission('delete_user') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Trash2}
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {users.length === 0 && !loading && (
          <div className="text-center py-12">
            <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No users found</p>
            <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.total > pagination.limit && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} results
          </p>
          
          <div className="flex items-center gap-2">
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

      {/* User Modal */}
      <UserModal
        isOpen={showUserModal}
        user={selectedUser}
        onClose={() => {
          setShowUserModal(false);
          setSelectedUser(null);
        }}
        onSave={() => {
          setShowUserModal(false);
          setSelectedUser(null);
          fetchUsers();
        }}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Delete User"
        message={`Are you sure you want to delete ${userToDelete?.fullName || userToDelete?.username}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowConfirmDialog(false);
          setUserToDelete(null);
        }}
        variant="danger"
      />
    </div>
  );
};

export default UserManagement;