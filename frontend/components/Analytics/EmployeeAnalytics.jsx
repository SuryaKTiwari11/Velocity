import React from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
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
import { motion } from 'framer-motion';
import { chartColors, formatNumber } from '../../utils/chartConfig';

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

export default function EmployeeAnalytics({ data, loading }) {
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

  // Salary distribution chart data
  const salaryChartData = {
    labels: data.salaryDistribution?.map(item => item.range) || [],
    datasets: [{
      label: 'Number of Employees',
      data: data.salaryDistribution?.map(item => item.count) || [],
      backgroundColor: [
        chartColors.primary,
        chartColors.secondary,
        chartColors.success,
        chartColors.warning
      ],
      borderColor: '#1e293b',
      borderWidth: 2,
      borderRadius: 6
    }]
  };

  // Department distribution chart data
  const departmentChartData = {
    labels: data.departmentStats?.map(item => item.department) || [],
    datasets: [{
      data: data.departmentStats?.map(item => item.count) || [],
      backgroundColor: [
        chartColors.primary,
        chartColors.secondary,
        chartColors.success,
        chartColors.warning,
        chartColors.info
      ],
      borderColor: '#1e293b',
      borderWidth: 3
    }]
  };

  // Monthly hiring trends data
  const hiringTrendData = {
    labels: data.monthlyHiring?.map(item => item.month) || [],
    datasets: [{
      label: 'New Hires',
      data: data.monthlyHiring?.map(item => item.hired) || [],
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
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-slate-300 text-sm font-medium mb-2">Total Employees</h3>
          <p className="text-2xl font-bold text-white">{formatNumber(data.totalEmployees || 0)}</p>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-slate-300 text-sm font-medium mb-2">Departments</h3>
          <p className="text-2xl font-bold text-white">{data.departmentStats?.length || 0}</p>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-slate-300 text-sm font-medium mb-2">Avg Salary Range</h3>
          <p className="text-2xl font-bold text-white">
            {data.departmentStats?.length > 0 
              ? `₹${Math.round(data.departmentStats.reduce((sum, dept) => sum + dept.avgSalary, 0) / data.departmentStats.length / 1000)}K`
              : '₹0'
            }
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Salary Distribution */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Salary Distribution</h3>
          <div className="h-64">
            <Bar data={salaryChartData} options={chartOptions} />
          </div>
        </div>

        {/* Department Distribution */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Department Distribution</h3>
          <div className="h-64">
            <Doughnut data={departmentChartData} options={pieOptions} />
          </div>
        </div>

        {/* Hiring Trends */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 lg:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-4">Monthly Hiring Trends</h3>
          <div className="h-64">
            <Line data={hiringTrendData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
