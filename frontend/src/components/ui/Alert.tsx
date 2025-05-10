'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

interface AlertProps {
  children: React.ReactNode;
  variant?: 'success' | 'error' | 'warning' | 'info';
  className?: string;
  visible: boolean;
  onClose: () => void;
}

const variants = {
  success: 'bg-green-50 text-green-700 border-green-400',
  error: 'bg-red-50 text-red-700 border-red-400',
  warning: 'bg-yellow-50 text-yellow-700 border-yellow-400',
  info: 'bg-blue-50 text-blue-700 border-blue-400',
};

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

export const Alert: React.FC<AlertProps> = ({ 
  children, 
  variant = 'info',
  className,
  visible,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      setIsExiting(false);
    } else {
      setIsExiting(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300); // Match this with the transition duration
      return () => clearTimeout(timer);
    }
  }, [visible]);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible && !isExiting) return null;

  const Icon = icons[variant];

  return (
    <div
      className={cn(
        'fixed top-4 right-4 p-4 rounded-lg shadow-lg z-[9999] transition-all duration-300',
        variants[variant],
        isExiting ? 'translate-x-full opacity-0 scale-95' : 'translate-x-0 opacity-100 scale-100',
        className
      )}
      role="alert"
    >
      <div className="flex items-center">
        <Icon className="w-5 h-5 ml-2" />
        <p className="mr-2">{children}</p>
      </div>
    </div>
  );
};
