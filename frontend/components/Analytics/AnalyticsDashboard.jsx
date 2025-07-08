import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CounterCard from './CounterCard';
import EmployeeAnalytics from './EmployeeAnalytics';
import RevenueAnalytics from './RevenueAnalytics';
import DocumentAnalytics from './DocumentAnalytics';
import { useAnalyticsData } from '../../hook/useAnalyticsData';

// Icons for counter cards
const UsersIcon = () => (
  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
  </svg>
);

const DocumentIcon = () => (
  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
  </svg>
);

const RevenueIcon = () => (
  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
  </svg>
);

const EmployeeIcon = () => (
  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
);

export default function AnalyticsDashboard() {
  const { data, loading, error, refresh } = useAnalyticsData();
  const [activeTab, setActiveTab] = useState('overview');

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      refresh.all();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [refresh]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    // Load data for the selected tab if not already loaded
    switch (tab) {
      case 'employees':
        if (!data.employees) refresh.employees();
        break;
      case 'revenue':
        if (!data.revenue) refresh.revenue();
        break;
      case 'documents':
        if (!data.documents) refresh.documents();
        break;
      default:
        break;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'employees', label: 'Employees', icon: '👥' },
    { id: 'revenue', label: 'Revenue', icon: '💰' },
    { id: 'documents', label: 'Documents', icon: '📄' }
  ];

  return (
    <div className="min-h-screen bg-slate-900 relative">
      {/* Main Content */}
      <div className="relative z-10 p-6">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
              <p className="text-slate-300">Real-time insights for your Employee Management System</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <button
                onClick={() => refresh.all()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                disabled={Object.values(loading).some(l => l)}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div
            className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg mb-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <p>Error: {error}</p>
          </motion.div>
        )}

        {/* Tab Navigation */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content Area */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Quick Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <CounterCard
                  title="Total Employees"
                  value={data.dashboard?.quickStats?.employees || 0}
                  icon={<EmployeeIcon />}
                  color="bg-blue-500"
                  loading={loading.dashboard}
                />
                <CounterCard
                  title="Total Users"
                  value={data.dashboard?.quickStats?.users || 0}
                  icon={<UsersIcon />}
                  color="bg-green-500"
                  loading={loading.dashboard}
                />
                <CounterCard
                  title="Documents"
                  value={data.dashboard?.quickStats?.documents || 0}
                  icon={<DocumentIcon />}
                  color="bg-purple-500"
                  loading={loading.dashboard}
                />
                <CounterCard
                  title="Premium Users"
                  value={data.dashboard?.quickStats?.premiumUsers || 0}
                  icon={<RevenueIcon />}
                  color="bg-yellow-500"
                  loading={loading.dashboard}
                />
              </div>

              {/* Recent Activity */}
              {data.dashboard?.recentActivity && (
                <motion.div
                  className="bg-slate-800 rounded-xl p-6 border border-slate-700"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Activity (Last 30 Days)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-400">{data.dashboard.recentActivity.newEmployees}</p>
                      <p className="text-slate-300 text-sm">New Employees</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-400">{data.dashboard.recentActivity.newUsers}</p>
                      <p className="text-slate-300 text-sm">New Users</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-400">{data.dashboard.recentActivity.newDocuments}</p>
                      <p className="text-slate-300 text-sm">New Documents</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* Employee Analytics Tab */}
          {activeTab === 'employees' && (
            <EmployeeAnalytics data={data.employees} loading={loading.employees} />
          )}

          {/* Revenue Analytics Tab */}
          {activeTab === 'revenue' && (
            <RevenueAnalytics data={data.revenue} loading={loading.revenue} />
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <DocumentAnalytics data={data.documents} loading={loading.documents} />
          )}
        </motion.div>
      </div>
    </div>
  );
}
