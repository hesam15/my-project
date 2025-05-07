'use client';

import { useAuthContext } from '@/contexts/AuthContext';
import type { LoginCredentials, RegisterCredentials, User } from '@/types/auth';

export const useAuth = () => {
  const context = useAuthContext();
  return {
    user: context.user,
    loading: context.loading,
    error: context.error,
    login: context.login,
    register: context.register,
    logout: context.logout,
    checkAuth: context.checkAuth,
  };
};