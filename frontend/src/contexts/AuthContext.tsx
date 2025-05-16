'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  name: string;
  phone: string;
  role?: string;
  balance?: number | null;
  roles?: { name: string }[];
}

interface LoginCredentials {
  phone: string;
  password: string;
}

interface RegisterCredentials {
  name: string;
  phone: string;
  password: string;
  password_confirmation: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  console.log('AuthProvider - User:', user);
  console.log('AuthProvider - Loading:', loading);

  const getCsrfToken = async () => {
    try {
      console.log('Fetching CSRF token from:', `${process.env.NEXT_PUBLIC_API_URL}/sanctum/csrf-cookie`);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sanctum/csrf-cookie`, {
        method: 'GET',
        credentials: 'include',
      });
      console.log('CSRF response status:', response.status);
      if (response.ok) {
        const xsrfToken = document.cookie
          .split('; ')
          .find((row) => row.startsWith('XSRF-TOKEN='))
          ?.split('=')[1];
        return xsrfToken;
      } else {
        throw new Error('Failed to fetch CSRF token');
      }
    } catch (err) {
      console.error('Error fetching CSRF token:', err);
      throw err;
    }
  };

  const checkAuth = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('checkAuth - Sending request to:', `${process.env.NEXT_PUBLIC_API_URL}/api/users/check`);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/check`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log('checkAuth - Response status:', response.status);
      console.log('checkAuth - Response headers:', [...response.headers.entries()]);
      if (response.ok) {
        const responseData = await response.json();
        console.log('checkAuth - Response data:', responseData);
        // مدیریت فرمت پاسخ که شامل { user: { ... } } است
        const userData = responseData.user || responseData;
        console.log('checkAuth - Extracted user data:', userData);
        setUser(userData);
        console.log('checkAuth - User set:', userData);
      } else {
        const errorData = await response.json();


        setUser(null);
        setError(errorData.message || 'خطا در بررسی احراز هویت');
      }
    } catch (error) {
      console.error('checkAuth - Error:', error);
      setUser(null);
      setError('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
      console.log('checkAuth - Loading set to false');
    }
  };

  useEffect(() => {
    console.log('useEffect - Running checkAuth');
    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      console.log('login - Response status:', response.status);
      console.log('login - Response headers:', [...response.headers.entries()]);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('login - Failed with status:', response.status, errorData);
        throw new Error(errorData.message || 'خطا در ورود');
      }

      const data = await response.json();
      console.log('login - Response data:', data);

      const userData = data.user || data;
      console.log('login - Extracted user data:', userData);
      setUser(userData);
      console.log('login - User set:', userData);
      router.push('/');
    } catch (error) {
      console.error('login - Error:', error);
      setError(error instanceof Error ? error.message : 'خطا در ورود');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      setLoading(true);
      setError(null);

      const xsrfToken = await getCsrfToken();

      console.log('register - Request payload:', credentials);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/register`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-XSRF-TOKEN': decodeURIComponent(xsrfToken || ''),
        },
        body: JSON.stringify(credentials),
      });

      console.log('register - Response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('register - Failed with status:', response.status, errorData);
        throw new Error(errorData.message || 'خطا در ثبت‌نام');
      }

      const data = await response.json();
      console.log('register - Response data:', data);
      router.push('/login');
    } catch (error) {
      console.error('register - Error:', error);
      setError(error instanceof Error ? error.message : 'خطا در ثبت‌نام');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);

      const xsrfToken = await getCsrfToken();
      console.log('logout - XSRF-TOKEN:', xsrfToken);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-XSRF-TOKEN': decodeURIComponent(xsrfToken || ''),
        },
      });

      console.log('logout - Response status:', response.status);
      document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
      document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
      document.cookie = 'laravel_session=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';

      setUser(null);
      console.log('logout - User set to null');
      router.push('/login');
    } catch (error) {
      console.error('logout - Error:', error);
      setError('خطا در خروج از سیستم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
