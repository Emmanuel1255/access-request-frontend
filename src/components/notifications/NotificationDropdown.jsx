import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Clock, 
  FileText, 
  User, 
  X,
  Settings
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import useNotificationStore from '../../store/notificationStore';
import Button from '../common/Button';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  } = useNotificationStore();

  useEffect(() => {
    if (isOpen && notifications.length === 0) {
      fetchNotifications();
    }
  }, [isOpen, notifications.length, fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  console.log(notifications);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'approval_request':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'request_approved':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'request_rejected':
        return <X className="w-4 h-4 text-red-500" />;
      case 'user_mention':
        return <User className="w-4 h-4 text-blue-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    
    // Handle navigation based on notification type
    if (notification.data?.requestId) {
      // Navigate to request detail
      console.log('Navigate to request:', notification.data.requestId);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-africell-primary"
      >
        <Bell className="w-5 h-5 text-gray-500" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex absolute -top-1 -right-1 justify-center items-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="flex absolute right-0 z-50 flex-col mt-2 w-96 max-h-96 bg-white rounded-lg border border-gray-200 shadow-lg"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <div className="flex gap-2 items-center">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    icon={CheckCheck}
                  >
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Settings}
                  onClick={() => {
                    setIsOpen(false);
                    // Navigate to notification preferences
                  }}
                />
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <div className="w-6 h-6 rounded-full border-b-2 animate-spin border-africell-primary" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="mx-auto mb-4 w-12 h-12 text-gray-300" />
                  <p className="font-medium text-gray-500">No notifications</p>
                  <p className="text-sm text-gray-400">You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.isRead ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <p className={`text-sm font-medium ${
                              !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </p>
                            {!notification.isRead && (
                              <div className="flex-shrink-0 mt-1 w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                          </div>
                          <p className={`text-sm mt-1 ${
                            !notification.isRead ? 'text-gray-700' : 'text-gray-500'
                          }`}>
                            {notification.message}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 bg-gray-50 border-t border-gray-200">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-center"
                  onClick={() => {
                    setIsOpen(false);
                    // Navigate to all notifications page
                  }}
                >
                  View all notifications
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;