import React from 'react';
import { PRIORITY_CONFIG } from '../../data/demoData';

const PriorityBadge = ({ priority, size = 'sm', showIcon = false }) => {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.normal;
  
  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  const getIcon = () => {
    switch (priority) {
      case 'urgent':
        return '🔴';
      case 'high':
        return '🟡';
      case 'normal':
        return '🔵';
      case 'low':
        return '⚪';
      default:
        return '🔵';
    }
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${config.color} ${sizeClasses[size]}`}>
      {showIcon && (
        <span className="mr-1" aria-hidden="true">
          {getIcon()}
        </span>
      )}
      {config.label}
    </span>
  );
};

export default PriorityBadge;