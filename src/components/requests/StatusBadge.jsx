import React from 'react';
import { STATUS_CONFIG } from '../../data/demoData';

const StatusBadge = ({ status, size = 'sm' }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  
  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${config.color} ${sizeClasses[size]}`}>
      <span 
        className={`w-2 h-2 rounded-full mr-1.5 ${config.badgeColor}`}
        aria-hidden="true"
      />
      {config.label}
    </span>
  );
};

export default StatusBadge;