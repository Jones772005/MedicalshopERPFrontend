import React from 'react';

export const Card = ({ children, className = '' }) => (
  <div
    className={`rounded-[8px] shadow-sm border ${className}`}
    style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
  >
    {children}
  </div>
);

export const CardHeader = ({ children, className = '' }) => (
  <div
    className={`px-6 py-4 border-b ${className}`}
    style={{ borderColor: 'var(--border-color)' }}
  >
    {children}
  </div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold leading-6 text-[#102A43] dark:text-[#F8FAFC] ${className}`}>
    {children}
  </h3>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);
