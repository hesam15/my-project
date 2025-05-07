"use client";

import { useEffect } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title = 'تأیید عملیات',
  message,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 touch-none">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-[360px] min-w-[300px] mx-auto">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-right mb-2">{title}</h2>
          <p className="text-right text-gray-700 leading-6 text-base">{message}</p>
        </div>
        
        <div className="flex flex-col gap-2">
          <button
            onClick={onConfirm}
            className="w-full py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 
                     active:scale-95 transition-all duration-200 text-base font-medium"
          >
            حذف
          </button>
          <button
            onClick={onCancel}
            className="w-full py-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 
                     active:scale-95 transition-all duration-200 text-base font-medium"
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
}