'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface AlertProps {
  children: React.ReactNode;
  variant?: 'success' | 'error' | 'warning' | 'info';
  className?: string;
}

const variants = {
  success: 'bg-green-50 text-green-700 border-green-400',
  error: 'bg-red-50 text-red-700 border-red-400',
  warning: 'bg-yellow-50 text-yellow-700 border-yellow-400',
  info: 'bg-blue-50 text-blue-700 border-blue-400',
};

export const Alert: React.FC<AlertProps> = ({ 
  children, 
  variant = 'info',
  className 
}) => {
  return (
    <div
      className={cn(
        'p-4 rounded-md border',
        variants[variant],
        className
      )}
      role="alert"
    >
      <div className="text-sm font-medium">
        {children}
      </div>
    </div>
  );
};
