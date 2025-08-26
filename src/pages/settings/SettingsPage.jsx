import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Save,
  Bell,
  Shield,
  Users,
  Database,
  Mail,
  Server,
  Download,
  Upload,
  RefreshCw,
  Eye,
  EyeOff,
  Check,
  X,
  AlertTriangle,
  Globe,
  Clock,
  Palette,
  Monitor,
  Moon,
  Sun,
  Settings as SettingsIcon,
  Key,
  FileText,
  Zap
} from 'lucide-react';
import Button from '../../components/common/Button';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, hasPermission, isAdmin } = useAuthStore();
  
  // Settings categories
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testingDatabase, setTestingDatabase] = useState(false);

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Africell Request Approval System',
    siteDescription: 'Streamlined workflow management for IT access requests',
    timezone: 'UTC',
    dateFormat: 'DD/MM/YYYY',
    language: 'en',
    defaultTheme: 'light',
    sessionTimeout: 60,
    maxFileSize: 10,
    allowedFileTypes: 'pdf,doc,docx,xls,xlsx,png,jpg,jpeg',
    requireTwoFactor: false,
    passwordMinLength: 8,
    passwordRequireSpecial: true
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    notifyNewRequests: true,
    notifyApprovals: true,
    notifyRejections: true,
    notifyComments: true,
    digestFrequency: 'daily',
    quietHours: true,
    quietStart: '18:00',
    quietEnd: '08:00'
  });

  // Email Settings
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.africell.sl',
    smtpPort: 587,
    smtpUsername: 'notifications@africell.sl',
    smtpPassword: '',
    smtpSecure: true,
    fromEmail: 'noreply@africell.sl',
    fromName: 'Africell Request System',
    testEmail: user?.email || ''
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    enforceHttps: true,
    sessionCookieSecure: true,
    ipWhitelist: '',
    maxLoginAttempts: 5,
    lockoutDuration: 30,
    auditLogging: true,
    dataRetentionDays: 365,
    autoLogoutInactive: true,
    inactivityTimeout: 30
  });

  // Approval Settings
  const [approvalSettings, setApprovalSettings] = useState({
    defaultApprovalTimeout: 72,
    escalationEnabled: true,
    escalationTimeout: 24,
    allowDelegation: true,
    requireComments: false,
    allowSelfApproval: false,
    parallelApprovals: false,
    autoReminders: true,
    reminderInterval: 24
  });

  // System Settings
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    debugMode: false,
    cacheEnabled: true,
    cacheTtl: 3600,
    backupFrequency: 'daily',
    backupRetention: 30,
    logLevel: 'info',
    maxRequestsPerHour: 1000
  });

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'approvals', label: 'Approvals', icon: FileText },
    { id: 'system', label: 'System', icon: Server }
  ];

  const handleSave = async (category) => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real app, save to backend
      console.log(`Saving ${category} settings:`, {
        general: generalSettings,
        notifications: notificationSettings,
        email: emailSettings,
        security: securitySettings,
        approvals: approvalSettings,
        system: systemSettings
      }[category]);
      
      toast.success(`${category.charAt(0).toUpperCase() + category.slice(1)} settings saved successfully`);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const testEmailConnection = async () => {
    setTestingEmail(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Test email sent successfully');
    } catch (error) {
      toast.error('Failed to send test email');
    } finally {
      setTestingEmail(false);
    }
  };

  const testDatabaseConnection = async () => {
    setTestingDatabase(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Database connection successful');
    } catch (error) {
      toast.error('Database connection failed');
    } finally {
      setTestingDatabase(false);
    }
  };

  const exportSettings = () => {
    const settings = {
      general: generalSettings,
      notifications: notificationSettings,
      email: emailSettings,
      security: securitySettings,
      approvals: approvalSettings,
      system: systemSettings
    };
    
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `settings_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Settings exported successfully');
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-medium text-gray-900">Site Configuration</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Site Name</label>
            <input
              type="text"
              value={generalSettings.siteName}
              onChange={(e) => setGeneralSettings(prev => ({ ...prev, siteName: e.target.value }))}
              className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-africell-primary focus:ring-africell-primary sm:text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Timezone</label>
            <select
              value={generalSettings.timezone}
              onChange={(e) => setGeneralSettings(prev => ({ ...prev, timezone: e.target.value }))}
              className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-africell-primary focus:ring-africell-primary sm:text-sm"
            >
              <option value="UTC">UTC</option>
              <option value="Africa/Freetown">Africa/Freetown</option>
              <option value="Africa/Lagos">Africa/Lagos</option>
              <option value="Europe/London">Europe/London</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Site Description</label>
          <textarea
            rows={3}
            value={generalSettings.siteDescription}
            onChange={(e) => setGeneralSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
            className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-africell-primary focus:ring-africell-primary sm:text-sm"
          />
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-medium text-gray-900">Localization</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Date Format</label>
            <select
              value={generalSettings.dateFormat}
              onChange={(e) => setGeneralSettings(prev => ({ ...prev, dateFormat: e.target.value }))}
              className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-africell-primary focus:ring-africell-primary sm:text-sm"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Language</label>
            <select
              value={generalSettings.language}
              onChange={(e) => setGeneralSettings(prev => ({ ...prev, language: e.target.value }))}
              className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-africell-primary focus:ring-africell-primary sm:text-sm"
            >
              <option value="en">English</option>
              <option value="fr">French</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-medium text-gray-900">File Upload Settings</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Max File Size (MB)</label>
            <input
              type="number"
              value={generalSettings.maxFileSize}
              onChange={(e) => setGeneralSettings(prev => ({ ...prev, maxFileSize: parseInt(e.target.value) }))}
              className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-africell-primary focus:ring-africell-primary sm:text-sm"
              min="1"
              max="100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Session Timeout (minutes)</label>
            <input
              type="number"
              value={generalSettings.sessionTimeout}
              onChange={(e) => setGeneralSettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
              className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-africell-primary focus:ring-africell-primary sm:text-sm"
              min="5"
              max="480"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={() => handleSave('general')}
          loading={isSaving}
          icon={Save}
        >
          Save General Settings
        </Button>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-medium text-gray-900">Notification Channels</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-500">Receive notifications via email</p>
            </div>
            <label className="inline-flex relative items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings.emailNotifications}
                onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-africell-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-africell-primary"></div>
            </label>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-900">Push Notifications</p>
              <p className="text-sm text-gray-500">Browser push notifications</p>
            </div>
            <label className="inline-flex relative items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings.pushNotifications}
                onChange={(e) => setNotificationSettings(prev => ({ ...prev, pushNotifications: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-africell-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-africell-primary"></div>
            </label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-medium text-gray-900">Notification Types</h3>
        <div className="space-y-4">
          {[
            { key: 'notifyNewRequests', label: 'New Request Submissions', desc: 'When new requests are submitted' },
            { key: 'notifyApprovals', label: 'Approval Actions', desc: 'When requests are approved' },
            { key: 'notifyRejections', label: 'Rejection Actions', desc: 'When requests are rejected' },
            { key: 'notifyComments', label: 'Comments & Messages', desc: 'When comments are added to requests' }
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
              <label className="inline-flex relative items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings[key]}
                  onChange={(e) => setNotificationSettings(prev => ({ ...prev, [key]: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-africell-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-africell-primary"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-medium text-gray-900">Quiet Hours</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-900">Enable Quiet Hours</p>
              <p className="text-sm text-gray-500">Disable notifications during specified hours</p>
            </div>
            <label className="inline-flex relative items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings.quietHours}
                onChange={(e) => setNotificationSettings(prev => ({ ...prev, quietHours: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-africell-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-africell-primary"></div>
            </label>
          </div>

          {notificationSettings.quietHours && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Time</label>
                <input
                  type="time"
                  value={notificationSettings.quietStart}
                  onChange={(e) => setNotificationSettings(prev => ({ ...prev, quietStart: e.target.value }))}
                  className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-africell-primary focus:ring-africell-primary sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Time</label>
                <input
                  type="time"
                  value={notificationSettings.quietEnd}
                  onChange={(e) => setNotificationSettings(prev => ({ ...prev, quietEnd: e.target.value }))}
                  className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-africell-primary focus:ring-africell-primary sm:text-sm"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={() => handleSave('notifications')}
          loading={isSaving}
          icon={Save}
        >
          Save Notification Settings
        </Button>
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-medium text-gray-900">SMTP Configuration</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">SMTP Host</label>
            <input
              type="text"
              value={emailSettings.smtpHost}
              onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
              className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-africell-primary focus:ring-africell-primary sm:text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">SMTP Port</label>
            <input
              type="number"
              value={emailSettings.smtpPort}
              onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPort: parseInt(e.target.value) }))}
              className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-africell-primary focus:ring-africell-primary sm:text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              value={emailSettings.smtpUsername}
              onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpUsername: e.target.value }))}
              className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-africell-primary focus:ring-africell-primary sm:text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={emailSettings.smtpPassword}
              onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPassword: e.target.value }))}
              className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-africell-primary focus:ring-africell-primary sm:text-sm"
              placeholder="Enter SMTP password"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex items-center">
            <input
              id="smtpSecure"
              type="checkbox"
              checked={emailSettings.smtpSecure}
              onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpSecure: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-300 text-africell-primary focus:ring-africell-primary"
            />
            <label htmlFor="smtpSecure" className="block ml-2 text-sm text-gray-900">
              Use SSL/TLS encryption
            </label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-medium text-gray-900">Email Settings</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">From Email</label>
            <input
              type="email"
              value={emailSettings.fromEmail}
              onChange={(e) => setEmailSettings(prev => ({ ...prev, fromEmail: e.target.value }))}
              className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-africell-primary focus:ring-africell-primary sm:text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">From Name</label>
            <input
              type="text"
              value={emailSettings.fromName}
              onChange={(e) => setEmailSettings(prev => ({ ...prev, fromName: e.target.value }))}
              className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-africell-primary focus:ring-africell-primary sm:text-sm"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-medium text-gray-900">Test Email</h3>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">Test Email Address</label>
            <input
              type="email"
              value={emailSettings.testEmail}
              onChange={(e) => setEmailSettings(prev => ({ ...prev, testEmail: e.target.value }))}
              className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-africell-primary focus:ring-africell-primary sm:text-sm"
            />
          </div>
          <Button
            onClick={testEmailConnection}
            loading={testingEmail}
            variant="outline"
            icon={Mail}
          >
            Send Test Email
          </Button>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={() => handleSave('email')}
          loading={isSaving}
          icon={Save}
        >
          Save Email Settings
        </Button>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-medium text-gray-900">Authentication Security</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Max Login Attempts</label>
              <input
                type="number"
                value={securitySettings.maxLoginAttempts}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) }))}
                className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-africell-primary focus:ring-africell-primary sm:text-sm"
                min="3"
                max="10"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Lockout Duration (minutes)</label>
              <input
                type="number"
                value={securitySettings.lockoutDuration}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, lockoutDuration: parseInt(e.target.value) }))}
                className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-africell-primary focus:ring-africell-primary sm:text-sm"
                min="5"
                max="120"
              />
            </div>
          </div>
          
          <div className="space-y-3">
            {[
              { key: 'enforceHttps', label: 'Enforce HTTPS', desc: 'Redirect all HTTP requests to HTTPS' },
              { key: 'sessionCookieSecure', label: 'Secure Session Cookies', desc: 'Only send cookies over HTTPS' },
              { key: 'auditLogging', label: 'Audit Logging', desc: 'Log all user actions for security auditing' },
              { key: 'autoLogoutInactive', label: 'Auto Logout Inactive Users', desc: 'Automatically log out inactive users' }
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-900">{label}</p>
                  <p className="text-sm text-gray-500">{desc}</p>
                </div>
                <label className="inline-flex relative items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={securitySettings[key]}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, [key]: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-africell-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-africell-primary"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-medium text-gray-900">Data Protection</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Data Retention (days)</label>
            <input
              type="number"
              value={securitySettings.dataRetentionDays}
              onChange={(e) => setSecuritySettings(prev => ({ ...prev, dataRetentionDays: parseInt(e.target.value) }))}
              className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-africell-primary focus:ring-africell-primary sm:text-sm"
              min="30"
              max="2555"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Inactivity Timeout (minutes)</label>
            <input
              type="number"
              value={securitySettings.inactivityTimeout}
              onChange={(e) => setSecuritySettings(prev => ({ ...prev, inactivityTimeout: parseInt(e.target.value) }))}
              className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-africell-primary focus:ring-africell-primary sm:text-sm"
              min="5"
              max="120"
              disabled={!securitySettings.autoLogoutInactive}
            />
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">IP Whitelist</label>
          <textarea
            rows={3}
            value={securitySettings.ipWhitelist}
            onChange={(e) => setSecuritySettings(prev => ({ ...prev, ipWhitelist: e.target.value }))}
            placeholder="Enter IP addresses or ranges, one per line (e.g., 192.168.1.0/24)"
            className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-africell-primary focus:ring-africell-primary sm:text-sm"
          />
          <p className="mt-1 text-sm text-gray-500">Leave empty to allow all IPs</p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={() => handleSave('security')}
          loading={isSaving}
          icon={Save}
        >
          Save Security Settings
        </Button>
      </div>
    </div>
  );

  const renderApprovalSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-medium text-gray-900">Approval Timeouts</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Default Approval Timeout (hours)</label>
            <input
              type="number"
              value={approvalSettings.defaultApprovalTimeout}
              onChange={(e) => setApprovalSettings(prev => ({ ...prev, defaultApprovalTimeout: parseInt(e.target.value) }))}
              className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-africell-primary focus:ring-africell-primary sm:text-sm"
              min="1"
              max="168"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Escalation Timeout (hours)</label>
            <input
              type="number"
              value={approvalSettings.escalationTimeout}
              onChange={(e) => setApprovalSettings(prev => ({ ...prev, escalationTimeout: parseInt(e.target.value) }))}
              className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-africell-primary focus:ring-africell-primary sm:text-sm"
              min="1"
              max="72"
              disabled={!approvalSettings.escalationEnabled}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-medium text-gray-900">Approval Behavior</h3>
        <div className="space-y-4">
          {[
            { key: 'escalationEnabled', label: 'Enable Escalation', desc: 'Automatically escalate overdue approvals' },
            { key: 'allowDelegation', label: 'Allow Delegation', desc: 'Approvers can delegate their approval authority' },
            { key: 'requireComments', label: 'Require Comments', desc: 'Force approvers to add comments when approving/rejecting' },
            { key: 'allowSelfApproval', label: 'Allow Self Approval', desc: 'Users can approve their own requests' },
            { key: 'parallelApprovals', label: 'Parallel Approvals', desc: 'Allow multiple approvers to work simultaneously' },
            { key: 'autoReminders', label: 'Auto Reminders', desc: 'Send automatic reminder emails for pending approvals' }
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
              <label className="inline-flex relative items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={approvalSettings[key]}
                  onChange={(e) => setApprovalSettings(prev => ({ ...prev, [key]: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-africell-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-africell-primary"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-medium text-gray-900">Reminder Settings</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Reminder Interval (hours)</label>
            <input
              type="number"
              value={approvalSettings.reminderInterval}
              onChange={(e) => setApprovalSettings(prev => ({ ...prev, reminderInterval: parseInt(e.target.value) }))}
              className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-africell-primary focus:ring-africell-primary sm:text-sm"
              min="1"
              max="72"
              disabled={!approvalSettings.autoReminders}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={() => handleSave('approvals')}
          loading={isSaving}
          icon={Save}
        >
          Save Approval Settings
        </Button>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-medium text-gray-900">System Status</h3>
        <div className="space-y-4">
          {[
            { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Put the system in maintenance mode', icon: AlertTriangle, color: 'text-yellow-600' },
            { key: 'debugMode', label: 'Debug Mode', desc: 'Enable debug logging and error details', icon: Settings, color: 'text-blue-600' },
            { key: 'cacheEnabled', label: 'Enable Caching', desc: 'Cache frequently accessed data for better performance', icon: Zap, color: 'text-green-600' }
          ].map(({ key, label, desc, icon: Icon, color }) => (
            <div key={key} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div className="flex gap-3 items-center">
                <Icon className={`w-5 h-5 ${color}`} />
                <div>
                  <p className="text-sm font-medium text-gray-900">{label}</p>
                  <p className="text-sm text-gray-500">{desc}</p>
                </div>
              </div>
              <label className="inline-flex relative items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={systemSettings[key]}
                  onChange={(e) => setSystemSettings(prev => ({ ...prev, [key]: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-africell-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-africell-primary"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-medium text-gray-900">Performance Settings</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Cache TTL (seconds)</label>
            <input
              type="number"
              value={systemSettings.cacheTtl}
              onChange={(e) => setSystemSettings(prev => ({ ...prev, cacheTtl: parseInt(e.target.value) }))}
              className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-africell-primary focus:ring-africell-primary sm:text-sm"
              min="60"
              max="86400"
              disabled={!systemSettings.cacheEnabled}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Max Requests/Hour</label>
            <input
              type="number"
              value={systemSettings.maxRequestsPerHour}
              onChange={(e) => setSystemSettings(prev => ({ ...prev, maxRequestsPerHour: parseInt(e.target.value) }))}
              className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-africell-primary focus:ring-africell-primary sm:text-sm"
              min="100"
              max="10000"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-medium text-gray-900">Backup & Logging</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Backup Frequency</label>
            <select
              value={systemSettings.backupFrequency}
              onChange={(e) => setSystemSettings(prev => ({ ...prev, backupFrequency: e.target.value }))}
              className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-africell-primary focus:ring-africell-primary sm:text-sm"
            >
              <option value="never">Never</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Backup Retention (days)</label>
            <input
              type="number"
              value={systemSettings.backupRetention}
              onChange={(e) => setSystemSettings(prev => ({ ...prev, backupRetention: parseInt(e.target.value) }))}
              className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-africell-primary focus:ring-africell-primary sm:text-sm"
              min="1"
              max="365"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Log Level</label>
            <select
              value={systemSettings.logLevel}
              onChange={(e) => setSystemSettings(prev => ({ ...prev, logLevel: e.target.value }))}
              className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-africell-primary focus:ring-africell-primary sm:text-sm"
            >
              <option value="error">Error</option>
              <option value="warn">Warning</option>
              <option value="info">Info</option>
              <option value="debug">Debug</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-medium text-gray-900">System Operations</h3>
        <div className="flex gap-4">
          <Button
            onClick={testDatabaseConnection}
            loading={testingDatabase}
            variant="outline"
            icon={Database}
          >
            Test Database
          </Button>
          
          <Button
            onClick={exportSettings}
            variant="outline"
            icon={Download}
          >
            Export Settings
          </Button>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={() => handleSave('system')}
          loading={isSaving}
          icon={Save}
        >
          Save System Settings
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-gray-600">Manage your application configuration and preferences</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={exportSettings}
            variant="outline"
            icon={Download}
            size="sm"
          >
            Export All
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar Navigation */}
        <div className="flex-shrink-0 lg:w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-africell-100 text-africell-700 border-africell-200'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm"
          >
            {activeTab === 'general' && renderGeneralSettings()}
            {activeTab === 'notifications' && renderNotificationSettings()}
            {activeTab === 'email' && renderEmailSettings()}
            {activeTab === 'security' && renderSecuritySettings()}
            {activeTab === 'approvals' && renderApprovalSettings()}
            {activeTab === 'system' && renderSystemSettings()}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;