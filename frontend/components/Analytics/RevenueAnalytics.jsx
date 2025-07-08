import React from 'react';
import { motion } from 'framer-motion';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { chartColors, formatCurrency, formatNumber } from '../../utils/chartConfig';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function RevenueAnalytics({ data, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="animate-pulse">
              <div className="h-4 bg-slate-600 rounded w-32 mb-4"></div>
              <div className="h-64 bg-slate-600 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  // Monthly revenue trends
  const revenueChartData = {
    labels: data.monthlyRevenue?.map(item => item.month) || [],
    datasets: [{
      label: 'Revenue (₹)',
      data: data.monthlyRevenue?.map(item => item.revenue) || [],
      borderColor: chartColors.success,
      backgroundColor: chartColors.success + '20',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: chartColors.success,
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 6
    }]
  };

  // User growth vs revenue
  const userGrowthData = {
    labels: data.monthlyRegistrations?.map(item => item.month) || [],
    datasets: [
      {
        label: 'New Users',
        data: data.monthlyRegistrations?.map(item => item.registrations) || [],
        backgroundColor: chartColors.primary,
        borderColor: chartColors.primary,
        borderWidth: 2,
        borderRadius: 4,
        yAxisID: 'y'
      },
      {
        label: 'Premium Signups',
        data: data.monthlyRevenue?.map(item => item.users) || [],
        backgroundColor: chartColors.warning,
        borderColor: chartColors.warning,
        borderWidth: 2,
        borderRadius: 4,
        yAxisID: 'y'
      }
    ]
  };

  // Conversion funnel data
  const conversionData = {
    labels: ['Total Users', 'Premium Users'],
    datasets: [{
      data: [data.totalUsers || 0, data.premiumUsers || 0],
      backgroundColor: [chartColors.primary, chartColors.success],
      borderColor: '#1e293b',
      borderWidth: 3
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#e2e8f0',
          font: { size: 12 }
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8' },
        grid: { color: '#334155' }
      },
      y: {
        ticks: { 
          color: '#94a3b8',
          callback: function(value) {
            return formatCurrency(value);
          }
        },
        grid: { color: '#334155' },
        beginAtZero: true
      }
    }
  };

  const userGrowthOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#e2e8f0',
          font: { size: 12 }
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8' },
        grid: { color: '#334155' }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        ticks: { color: '#94a3b8' },
        grid: { color: '#334155' },
        beginAtZero: true
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#e2e8f0',
          font: { size: 11 },
          padding: 15
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div 
          className="bg-slate-800 rounded-xl p-6 border border-slate-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-slate-300 text-sm font-medium mb-2">Total Revenue</h3>
          <p className="text-2xl font-bold text-green-400">{formatCurrency(data.totalRevenue || 0)}</p>
        </motion.div>

        <motion.div 
          className="bg-slate-800 rounded-xl p-6 border border-slate-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h3 className="text-slate-300 text-sm font-medium mb-2">Premium Users</h3>
          <p className="text-2xl font-bold text-white">{formatNumber(data.premiumUsers || 0)}</p>
        </motion.div>

        <motion.div 
          className="bg-slate-800 rounded-xl p-6 border border-slate-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-slate-300 text-sm font-medium mb-2">Conversion Rate</h3>
          <p className="text-2xl font-bold text-yellow-400">{data.conversionRate || 0}%</p>
        </motion.div>

        <motion.div 
          className="bg-slate-800 rounded-xl p-6 border border-slate-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="text-slate-300 text-sm font-medium mb-2">Revenue/User</h3>
          <p className="text-2xl font-bold text-white">{formatCurrency(data.revenuePerUser || 0)}</p>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trends */}
        <motion.div 
          className="bg-slate-800 rounded-xl p-6 border border-slate-700 lg:col-span-2"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="text-lg font-semibold text-white mb-4">Monthly Revenue Trends</h3>
          <div className="h-64">
            <Line data={revenueChartData} options={chartOptions} />
          </div>
        </motion.div>

        {/* User Growth */}
        <motion.div 
          className="bg-slate-800 rounded-xl p-6 border border-slate-700"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h3 className="text-lg font-semibold text-white mb-4">User Growth</h3>
          <div className="h-64">
            <Bar data={userGrowthData} options={userGrowthOptions} />
          </div>
        </motion.div>

        {/* Conversion Funnel */}
        <motion.div 
          className="bg-slate-800 rounded-xl p-6 border border-slate-700"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h3 className="text-lg font-semibold text-white mb-4">User Conversion</h3>
          <div className="h-64">
            <Pie data={conversionData} options={pieOptions} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
