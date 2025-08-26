import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Home,
  FileText,
  Users,
  CheckSquare,
  Settings,
  LogOut,
  ChevronDown,
  Bell,
  Search,
  QrCode,
  ChevronLeft,
  Fingerprint,
  PanelLeftClose,
  PieChart,
  LayoutTemplate
} from 'lucide-react';
import toast from 'react-hot-toast';
import NotificationDropdown from '../notifications/NotificationDropdown';
import useAuthStore from '../../store/authStore';
import useNotificationStore from '../../store/notificationStore';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasPermission, isAdmin } = useAuthStore();
  const { unreadCount, fetchUnreadCount } = useNotificationStore();

  useEffect(() => {
    // Fetch unread notifications on mount
    if (user) {
      fetchUnreadCount();
    }
  }, [user, fetchUnreadCount]);

  const navigationItems = [
    {
      name: 'Dashboard',
      icon: Home,
      href: '/dashboard',
      permission: true
    },
    {
      name: 'My Requests',
      icon: FileText,
      href: '/requests',
      permission: true
    },
    {
      name: 'Pending Approvals',
      icon: CheckSquare,
      href: '/approvals',
      permission: true
    },
    {
      name: 'Form Templates',
      icon: LayoutTemplate,
      href: '/form-templates',
      permission: hasPermission('manage_templates')
    },
    {
      name: 'Users',
      icon: Users,
      href: '/users',
      permission: isAdmin()
    },
    {
      name: 'Reports',
      icon: PieChart,
      href: '/reports',
      permission: hasPermission('view_reports')
    },
    {
      name: 'Access',
      icon: Fingerprint,
      href: '/access',
      permission: isAdmin()
    },
    {
      name: 'Settings',
      icon: Settings,
      href: '/settings',
      permission: isAdmin()
    }
  ].filter(item => item.permission);

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const isActive = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black bg-opacity-50 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-white shadow-lg border-r border-gray-200 transform transition-all duration-300 ease-in-out z-50 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex justify-between items-center p-4 h-16 border-b border-gray-200">
            {!sidebarCollapsed && (
              <div className="flex gap-3 items-center">
                <div className="flex justify-center items-center w-10 h-9 rounded-xl bg-gradient-primary">
                  <img src="/logo/logonav.png" alt="Africell" className="w-full h-full" />
                </div>
                <div className="overflow-hidden">
                  <h1 className="font-bold text-gray-900 whitespace-nowrap">Request  Approval</h1>
                  <p className="text-xs text-gray-500 whitespace-nowrap">Workflow System</p>
                </div>
              </div>
            )}
            {sidebarCollapsed && (
              <div className="flex justify-center w-full">
                <div className="flex justify-center items-center w-10 h-9 rounded-xl bg-gradient-primary">
                  <img src="/logo/logonav.png" alt="Africell" className="w-8 h-8" />
                </div>
              </div>
            )}
            <div className="flex gap-2 items-center">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden justify-center items-center p-1 rounded-lg transition-colors lg:flex hover:bg-gray-100"
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <PanelLeftClose className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-lg transition-colors lg:hidden hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="overflow-y-auto flex-1 p-2 space-y-1">
            {navigationItems.map((item) => (
              <motion.button
                key={item.name}
                onClick={() => {
                  navigate(item.href);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 text-left text-sm font-medium rounded-lg transition-all duration-200 group ${
                  isActive(item.href)
                    ? 'bg-gradient-to-r from-africell-primary to-africell-dark text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-africell-primary'
                }`}
                whileHover={sidebarCollapsed ? { scale: 1.05 } : { x: 4 }}
                whileTap={{ scale: 0.98 }}
                title={sidebarCollapsed ? item.name : ''}
              >
                <div className="flex relative justify-center items-center w-5 h-5">
                  <item.icon className="flex-shrink-0 w-5 h-5" />
                </div>
                {!sidebarCollapsed && (
                  <span className="truncate">{item.name}</span>
                )}
                {sidebarCollapsed && (
                  <div className="absolute left-full px-2 py-1 ml-2 text-xs text-white whitespace-nowrap bg-gray-900 rounded opacity-0 group-hover:opacity-100">
                    {item.name}
                  </div>
                )}
              </motion.button>
            ))}
          </nav>

          {/* User Info */}
          <div className={`p-2 border-t border-gray-200 ${sidebarCollapsed ? 'px-2' : 'px-4'}`}>
            <div className={`flex ${sidebarCollapsed ? 'justify-center' : 'justify-between'} items-center p-2 bg-gray-50 rounded-lg`}>
              {!sidebarCollapsed && (
                <div className="flex gap-3 items-center min-w-0">
                  <div className="flex flex-shrink-0 justify-center items-center w-10 h-10 bg-gradient-to-r rounded-full from-africell-primary to-africell-secondary">
                    <span className="text-sm font-semibold text-white">
                      {user?.fullName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.fullName || user?.username}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {user?.role?.toUpperCase()}
                    </p>
                  </div>
                </div>
              )}
              {sidebarCollapsed && (
                <div className="flex justify-center items-center w-10 h-10 bg-gradient-to-r rounded-full from-africell-primary to-africell-secondary">
                  <span className="text-sm font-semibold text-white">
                    {user?.fullName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex justify-between items-center px-4 h-16 lg:px-6">
            {/* Left side */}
            <div className="flex gap-4 items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg transition-colors lg:hidden hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Page title */}
              <div className="hidden md:block">
                <h2 className="text-lg font-semibold text-gray-900">
                  {navigationItems.find(item => isActive(item.href))?.name || 'Request Approval System'}
                </h2>
              </div>
            </div>

            {/* Right side */}
            <div className="flex gap-3 items-center">
              {/* Search */}
              <button className="p-2 rounded-lg transition-colors hover:bg-gray-100">
                <Search className="w-5 h-5 text-gray-500" />
              </button>

              {/* Notifications */}
              <NotificationDropdown />

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex gap-3 items-center p-2 rounded-lg transition-colors hover:bg-gray-100"
                >
                  <div className="flex justify-center items-center w-8 h-8 bg-gradient-to-r rounded-full from-africell-primary to-africell-secondary">
                    <span className="text-sm font-semibold text-white">
                      {user?.fullName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden text-left md:block">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.fullName || user?.username}
                    </p>
                    <p className="text-xs text-gray-600">
                      {user?.role?.toUpperCase()}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 z-50 py-2 mt-2 w-56 bg-white rounded-lg border border-gray-200 shadow-lg"
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.fullName || user?.username}
                        </p>
                        <p className="text-sm text-gray-600">{user?.email}</p>
                        <p className="mt-1 text-xs text-gray-500">
                          {user?.role?.toUpperCase()}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          navigate('/profile');
                          setProfileDropdownOpen(false);
                        }}
                        className="flex gap-3 items-center px-4 py-2 w-full text-sm text-gray-700 transition-colors hover:bg-gray-50"
                      >
                        <Settings className="w-4 h-4" />
                        Profile Settings
                      </button>

                      <button
                        onClick={handleLogout}
                        className="flex gap-3 items-center px-4 py-2 w-full text-sm text-red-600 transition-colors hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      {/* Click outside to close dropdowns */}
      {profileDropdownOpen && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setProfileDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;