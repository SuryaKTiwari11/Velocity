import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function CounterCard({ 
  title, 
  value, 
  icon, 
  color = 'bg-indigo-500', 
  format = 'number',
  trend = null,
  loading = false 
}) {
  const [displayValue, setDisplayValue] = useState(0);

  // Animate number counting
  useEffect(() => {
    if (loading || !value) return;
    
    let start = 0;
    const end = parseInt(value) || 0;
    const duration = 2000; // 2 seconds
    const increment = end / (duration / 50);
    
    const counter = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(counter);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 50);

    return () => clearInterval(counter);
  }, [value, loading]);

  // Format display value based on type
  const formatDisplayValue = (val) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 0
        }).format(val);
      case 'percentage':
        return `${val}%`;
      case 'compact':
        if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
        if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
        return val.toString();
      default:
        return val.toLocaleString();
    }
  };

  if (loading) {
    return (
      <motion.div 
        className="bg-slate-800 rounded-xl p-6 border border-slate-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-slate-600 rounded w-24"></div>
            <div className="h-8 w-8 bg-slate-600 rounded"></div>
          </div>
          <div className="h-8 bg-slate-600 rounded w-20"></div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-300 text-sm font-medium">{title}</h3>
        <div className={`p-2 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <motion.div 
            className="text-2xl font-bold text-white mb-1"
            key={displayValue} // Re-trigger animation on value change
          >
            {formatDisplayValue(displayValue)}
          </motion.div>
          
          {trend && (
            <motion.div 
              className={`flex items-center text-xs ${
                trend.type === 'increase' 
                  ? 'text-green-400' 
                  : trend.type === 'decrease' 
                    ? 'text-red-400' 
                    : 'text-slate-400'
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {trend.type === 'increase' && (
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {trend.type === 'decrease' && (
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {trend.value} {trend.period}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
