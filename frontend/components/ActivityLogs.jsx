import React, { useState, useEffect } from 'react';
import { auditApi } from '../src/front2backconnect/api';
import { Eye, Shield, User, Calendar, Filter, RefreshCw } from 'lucide-react';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  
  // Filters
  const [filters, setFilters] = useState({
    action: '',
    tableName: '',
    page: 1,
    limit: 10,
  });

  const [activeTab, setActiveTab] = useState('audit'); // 'audit' or 'login'

  useEffect(() => {
    const loadLogs = async () => {
      setLoading(true);
      try {
        const response = activeTab === 'audit' 
          ? await auditApi.getLogs(filters)
          : await auditApi.getLoginHistory(filters);
        
        console.log('ActivityLogs API Response:', response);
        
        // Safely extract logs and pagination with fallbacks
        const responseData = response?.data || {};
        setLogs(responseData.data || []);
        setPagination(responseData.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 10,
        });
      } catch (error) {
        console.error('Failed to load logs:', error);
        // Reset to safe defaults on error
        setLogs([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 10,
        });
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, [filters, activeTab]);

  const refreshLogs = async () => {
    setLoading(true);
    try {
      const response = activeTab === 'audit' 
        ? await auditApi.getLogs(filters)
        : await auditApi.getLoginHistory(filters);
      
      console.log('ActivityLogs Refresh Response:', response);
      
      // Safely extract logs and pagination with fallbacks
      const responseData = response?.data || {};
      setLogs(responseData.data || []);
      setPagination(responseData.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
      });
    } catch (error) {
      console.error('Failed to load logs:', error);
      // Reset to safe defaults on error
      setLogs([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const resetFilters = () => {
    setFilters({
      action: '',
      tableName: '',
      page: 1,
      limit: 10,
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-800';
      case 'UPDATE': return 'bg-blue-100 text-blue-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    const pages = [];
    const maxPages = 5;
    const startPage = Math.max(1, pagination.currentPage - Math.floor(maxPages / 2));
    const endPage = Math.min(pagination.totalPages, startPage + maxPages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 mx-1 rounded ${
            i === pagination.currentPage
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-600">
          Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
          {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
          {pagination.totalItems} results
        </div>
        <div className="flex items-center">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrevPage}
            className="px-3 py-1 mx-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          {pages}
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNextPage}
            className="px-3 py-1 mx-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Shield className="w-6 h-6 mr-2" />
          Activity Logs
        </h2>
        <button
          onClick={refreshLogs}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Tab Buttons */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center ${
            activeTab === 'audit'
              ? 'bg-blue-500 text-white shadow-md'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Eye className="w-4 h-4 mr-2" />
          System Activity
        </button>
        <button
          onClick={() => setActiveTab('login')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center ${
            activeTab === 'login'
              ? 'bg-blue-500 text-white shadow-md'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <User className="w-4 h-4 mr-2" />
          Login History
        </button>
      </div>

      {/* Filters */}
      {activeTab === 'audit' && (
        <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={filters.action}
            onChange={(e) => handleFilterChange('action', e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          >
            <option value="">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
          </select>
          <select
            value={filters.tableName}
            onChange={(e) => handleFilterChange('tableName', e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          >
            <option value="">All Tables</option>
            <option value="employees">Employees</option>
            <option value="s3_documents">Documents</option>
            <option value="users">Users</option>
            <option value="attendance">Attendance</option>
          </select>
          <button
            onClick={resetFilters}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
          >
            Reset
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-100 border-b">
              {activeTab === 'audit' ? (
                <>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">User</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Table</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Record ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">IP Address</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                </>
              ) : (
                <>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">IP Address</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Reason</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={activeTab === 'audit' ? 6 : 5} className="px-4 py-8 text-center text-gray-500">
                  <div className="flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                    Loading activity logs...
                  </div>
                </td>
              </tr>
            ) : !logs || logs.length === 0 ? (
              <tr>
                <td colSpan={activeTab === 'audit' ? 6 : 5} className="px-4 py-8 text-center text-gray-500">
                  No activity logs found
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-b hover:bg-gray-50">
                  {activeTab === 'audit' ? (
                    <>
                      <td className="px-4 py-3 text-sm">
                        <div>
                        <div className="font-medium text-gray-900">
                            {log.user?.name || log.user?.email || log.email || 'Unknown'}
                        </div>
                        <div className="text-gray-500">{log.user?.email || log.email}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{log.tableName}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{log.recordId}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{log.ip_address}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        {formatDateTime(log.createdAt)}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium text-gray-900">{log.email}</div>
                        {log.User && (
                          <div className="text-gray-500">{log.User.name}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                          log.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {log.success ? 'Success' : 'Failed'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{log.ip_address}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{log.failure_reason || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        {formatDateTime(log.login_time || log.createdAt)}
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
};

export default ActivityLogs;
