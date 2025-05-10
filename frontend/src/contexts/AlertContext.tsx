'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export type AlertType = 'success' | 'info' | 'danger';

interface AlertState {
  message: string;
  type: AlertType;
  visible: boolean;
}

interface AlertContextType {
  showAlert: (message: string, type: AlertType) => void;
  hideAlert: () => void;
  alert: AlertState;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState<AlertState>({ message: '', type: 'info', visible: false });

  const showAlert = useCallback((message: string, type: AlertType) => {
    setAlert({ message, type, visible: true });
  }, []);

  const hideAlert = useCallback(() => {
    setAlert((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert, alert }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlert must be used within an AlertProvider');
  return ctx;
} 