import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

import { User } from '../data/user';
import { loginApiUser, registerApiUser } from '../services/api';

type AuthContextValue = {
  user: User | null;
  login: (phone: string, password: string) => Promise<string | null>;
  register: (name: string, phone: string, password: string) => Promise<string | null>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
};

function normalizePhone(phone: string) {
  return phone.replace(/[\s()-]/g, '').trim();
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const value = useMemo(
    () => ({
      user,
      async login(phone: string, password: string) {
        const normalizedPhone = normalizePhone(phone);
        if (!normalizedPhone || !password.trim()) {
          return 'Nhập số điện thoại và mật khẩu.';
        }
        if (!/^((\+84)|0)\d{9,10}$/.test(normalizedPhone)) {
          return 'Số điện thoại không hợp lệ.';
        }
        try {
          const response = await loginApiUser(normalizedPhone, password);
          setUser(response.data);
          return null;
        } catch (error) {
          return error instanceof Error ? error.message : 'Không thể đăng nhập.';
        }
      },
      async register(name: string, phone: string, password: string) {
        const normalizedPhone = normalizePhone(phone);
        if (!name.trim() || !normalizedPhone || !password.trim()) {
          return 'Nhập đầy đủ họ tên, số điện thoại và mật khẩu.';
        }
        if (!/^((\+84)|0)\d{9,10}$/.test(normalizedPhone)) {
          return 'Số điện thoại không hợp lệ.';
        }
        try {
          const response = await registerApiUser(name.trim(), normalizedPhone, password);
          setUser(response.data);
          return null;
        } catch (error) {
          return error instanceof Error ? error.message : 'Không thể đăng ký.';
        }
      },
      logout() {
        setUser(null);
      },
      updateUser(data: Partial<User>) {
        setUser((current) => {
          if (!current) {
            return current;
          }
          const updatedUser = { ...current, ...data };
          return updatedUser;
        });
      },
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải dùng trong AuthProvider');
  }
  return context;
}
