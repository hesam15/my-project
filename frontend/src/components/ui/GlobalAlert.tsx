'use client';
import { useEffect, useState } from 'react';

export interface GlobalAlertProps {
  message: string;
  type: 'success' | 'info' | 'danger';
  visible: boolean;
  onClose: () => void;
}

const colorMap = {
  success: 'bg-green-500 text-white',
  info: 'bg-blue-500 text-white',
  danger: 'bg-red-600 text-white',
};

export default function GlobalAlert({ message, type, visible, onClose }: GlobalAlertProps) {
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
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible && !isExiting) return null;

  return (
    <div
      className={`fixed top-6 right-4 z-[9999] max-w-xs w-full shadow-lg rounded-lg px-4 py-3 flex items-center gap-2 ${
        colorMap[type]
      } transition-all duration-300 ${
        isExiting 
          ? 'translate-x-full opacity-0 scale-95' 
          : 'translate-x-0 opacity-100 scale-100'
      }`}
      style={{ direction: 'rtl' }}
      role="alert"
    >
      <span className="flex-1 text-sm font-semibold">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-white/80 hover:text-white text-lg font-bold focus:outline-none"
        aria-label="بستن"
      >
        ×
      </button>
    </div>
  );
}

// Tailwind animation (add to your global CSS if not present):
// @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
// .animate-fade-in-up { animation: fade-in-up 0.3s ease; } 