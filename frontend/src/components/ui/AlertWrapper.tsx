'use client';
import GlobalAlert from './GlobalAlert';
import { useAlert } from '@/contexts/AlertContext';

export default function AlertWrapper() {
  const { alert, hideAlert } = useAlert();
  return (
    <GlobalAlert
      message={alert.message}
      type={alert.type}
      visible={alert.visible}
      onClose={hideAlert}
    />
  );
} 