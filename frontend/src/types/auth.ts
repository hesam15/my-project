export interface Balance {
  id: number;
  user_id: number;
  amount: number;
}

export interface Role {
  id: number;
  name: string;
  pivot?: {
    user_id: number;
    role_id: number;
  };
}

export interface User {
  id: number;
  name: string;
  phone: string;
  balance?: Balance | null;
  roles?: Role[];
}

export interface LoginCredentials {
  phone: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  phone: string;
  password: string;
  password_confirmation: string;
}