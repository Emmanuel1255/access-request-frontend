import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  TrendingUp,
  AlertCircle,
  Calendar
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { demoRequests, demoApprovalChains, REQUEST_STATUS } from '../../data/demoData';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';

const Dashboard = () => {
  const { user, isAdmin } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Calculate stats from demo data
    const userRequests = isAdmin() 
      ? demoRequests 
      : demoRequests.filter(r => r.requesterId === user?.id);
    
    const pendingApprovals = demoApprovalChains.filter(ac => 
      ac.approverId === user?.id && ac.status === 'pending'
    );

    const statsData = {
      totalRequests: userRequests.length,
      pendingRequests: userRequests.filter(r => r.status === REQUEST_STATUS.PENDING).length,
      approvedRequests: userRequests.filter(r => r.status === REQUEST_STATUS.APPROVED).length,
      rejectedRequests: userRequests.filter(r => r.status === REQUEST_STATUS.REJECTED).length,
      pendingApprovals: pendingApprovals.length,
      overdueApprovals: pendingApprovals.filter(ac => 
        new Date(ac.dueDate) < new Date()
      ).length
    };

    setStats(statsData);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Requests',
      value: stats.totalRequests,
      icon: FileText,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Pending Requests',
      value: stats.pendingRequests,
      icon: Clock,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Approved Requests',
      value: stats.approvedRequests,
      icon: CheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Rejected Requests',
      value: stats.rejectedRequests,
      icon: XCircle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    }
  ];

  const approvalCards = [
    {
      title: 'Pending Approvals',
      value: stats.pendingApprovals,
      icon: Users,
      color: 'bg-africell-primary',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: 'Overdue Approvals',
      value: stats.overdueApprovals,
      icon: AlertCircle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-africell-primary to-africell-secondary rounded-2xl p-8 text-white"
      >
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.fullName || user?.username}!
        </h1>
        <p className="text-white text-lg">
          Here's what's happening with your requests today.
        </p>
        <div className="mt-4 flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4" />
          <span>{new Date().toLocaleDateString('en-US', { 
            weekday: 'long',
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
      </motion.div>

      {/* Request Statistics */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Request Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                  <card.icon className={`w-6 h-6 ${card.textColor}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Approval Statistics (for approvers) */}
      {(isAdmin() || stats.pendingApprovals > 0) && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Approval Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {approvalCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">{card.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${card.bgColor}`}>
                    <card.icon className={`w-6 h-6 ${card.textColor}`} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-africell-primary to-africell-secondary rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Create New Request</h3>
              <p className="text-gray-600 text-sm mb-4">
                Start a new request using available templates
              </p>
              <Button variant="primary" size="sm" className="w-full">
                New Request
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Pending Approvals</h3>
              <p className="text-gray-600 text-sm mb-4">
                Review and process pending approvals
              </p>
              <Button variant="outline" size="sm" className="w-full">
                View Approvals
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">View Reports</h3>
              <p className="text-gray-600 text-sm mb-4">
                Access analytics and detailed reports
              </p>
              <Button variant="ghost" size="sm" className="w-full">
                View Reports
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Recent Activity Coming Soon</p>
            <p className="text-sm">
              This section will show your recent requests and approval activities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;