import React from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { motion } from 'framer-motion';
import { chartColors, formatNumber } from '../../utils/chartConfig';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function DocumentAnalytics({ data, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3].map((i) => (
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

  // Document type distribution chart
  const typeChartData = {
    labels: data.typeDistribution?.map(item => item.type) || [],
    datasets: [{
      data: data.typeDistribution?.map(item => item.count) || [],
      backgroundColor: [
        chartColors.primary,
        chartColors.secondary,
        chartColors.success,
        chartColors.warning
      ],
      borderColor: '#1e293b',
      borderWidth: 3
    }]
  };

  // Monthly upload trends
  const uploadTrendData = {
    labels: data.monthlyUploads?.map(item => item.month) || [],
    datasets: [{
      label: 'Document Uploads',
      data: data.monthlyUploads?.map(item => item.uploads) || [],
      backgroundColor: chartColors.secondary,
      borderColor: chartColors.secondary,
      borderWidth: 2,
      borderRadius: 6
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
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div 
          className="bg-slate-800 rounded-xl p-6 border border-slate-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-slate-300 text-sm font-medium mb-2">Total Documents</h3>
          <p className="text-2xl font-bold text-white">{formatNumber(data.totalDocuments || 0)}</p>
        </motion.div>

        <motion.div 
          className="bg-slate-800 rounded-xl p-6 border border-slate-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h3 className="text-slate-300 text-sm font-medium mb-2">File Types</h3>
          <p className="text-2xl font-bold text-white">{data.typeDistribution?.length || 0}</p>
        </motion.div>

        <motion.div 
          className="bg-slate-800 rounded-xl p-6 border border-slate-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-slate-300 text-sm font-medium mb-2">Storage Used</h3>
          <p className="text-2xl font-bold text-white">{data.storageInfo?.estimatedSize || '0 MB'}</p>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* File Type Distribution */}
        <motion.div 
          className="bg-slate-800 rounded-xl p-6 border border-slate-700"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-white mb-4">File Type Distribution</h3>
          <div className="h-64">
            <Doughnut data={typeChartData} options={pieOptions} />
          </div>
        </motion.div>

        {/* Upload Trends */}
        <motion.div 
          className="bg-slate-800 rounded-xl p-6 border border-slate-700"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="text-lg font-semibold text-white mb-4">Monthly Upload Trends</h3>
          <div className="h-64">
            <Bar data={uploadTrendData} options={chartOptions} />
          </div>
        </motion.div>
      </div>

      {/* File Details */}
      <motion.div 
        className="bg-slate-800 rounded-xl p-6 border border-slate-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <h3 className="text-lg font-semibold text-white mb-4">File Type Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.typeDistribution?.map((type, index) => (
            <div key={index} className="text-center">
              <p className="text-sm text-slate-300">{type.type}</p>
              <p className="text-xl font-bold text-white">{type.count}</p>
              <p className="text-xs text-slate-400">{type.percentage}%</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
