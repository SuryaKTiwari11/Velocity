// Chart.js configuration for analytics dashboard

export const chartColors = {
  primary: "#6366f1",
  secondary: "#8b5cf6",
  success: "#10b981",
  warning: "#f59e0b",
  info: "#3b82f6",
  gradient: {
    primary: ["#6366f1", "#8b5cf6"],
    success: ["#10b981", "#34d399"],
    warning: ["#f59e0b", "#fbbf24"],
  },
};

// Default chart options
export const defaultChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
      labels: {
        color: "#e2e8f0",
        font: {
          size: 12,
        },
      },
    },
    title: {
      display: false,
    },
  },
  scales: {
    x: {
      ticks: {
        color: "#94a3b8",
      },
      grid: {
        color: "#334155",
      },
    },
    y: {
      ticks: {
        color: "#94a3b8",
      },
      grid: {
        color: "#334155",
      },
    },
  },
};

// Bar chart configuration
export const barChartConfig = (data, label, color = chartColors.primary) => ({
  type: "bar",
  data: {
    labels: data.map((item) => item.label || item.month || item.range),
    datasets: [
      {
        label: label,
        data: data.map((item) => item.value || item.count || item.revenue),
        backgroundColor: color,
        borderColor: color,
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  },
  options: {
    ...defaultChartOptions,
    scales: {
      ...defaultChartOptions.scales,
      y: {
        ...defaultChartOptions.scales.y,
        beginAtZero: true,
      },
    },
  },
});

// Line chart configuration
export const lineChartConfig = (data, label, color = chartColors.primary) => ({
  type: "line",
  data: {
    labels: data.map((item) => item.month || item.label),
    datasets: [
      {
        label: label,
        data: data.map((item) => item.value || item.count || item.revenue),
        borderColor: color,
        backgroundColor: color + "20",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: color,
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 5,
      },
    ],
  },
  options: {
    ...defaultChartOptions,
    scales: {
      ...defaultChartOptions.scales,
      y: {
        ...defaultChartOptions.scales.y,
        beginAtZero: true,
      },
    },
  },
});

// Pie chart configuration
export const pieChartConfig = (data, colors = Object.values(chartColors)) => ({
  type: "pie",
  data: {
    labels: data.map((item) => item.label || item.type || item.range),
    datasets: [
      {
        data: data.map((item) => item.value || item.count || item.percentage),
        backgroundColor: colors.slice(0, data.length),
        borderColor: "#1e293b",
        borderWidth: 2,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#e2e8f0",
          font: {
            size: 11,
          },
          padding: 15,
        },
      },
    },
  },
});

// Doughnut chart configuration
export const doughnutChartConfig = (
  data,
  colors = Object.values(chartColors)
) => ({
  type: "doughnut",
  data: {
    labels: data.map((item) => item.label || item.department || item.type),
    datasets: [
      {
        data: data.map((item) => item.value || item.count),
        backgroundColor: colors.slice(0, data.length),
        borderColor: "#1e293b",
        borderWidth: 2,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: "#e2e8f0",
          font: {
            size: 11,
          },
          padding: 10,
        },
      },
    },
    cutout: "60%",
  },
});

// Format number for display
export const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

// Format currency for Indian Rupees
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount);
};

// Format percentage
export const formatPercentage = (value) => {
  return `${value}%`;
};
