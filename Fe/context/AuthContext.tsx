import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { User } from '../data/user';
import { getApiCurrentUser, loginApiUser, logoutApiUser, registerApiUser, updateApiUser } from '../services/api';

type AuthContextValue = {
  user: User | null;
  isReady: boolean;
  login: (phone: string, password: string) => Promise<string | null>;
  register: (name: string, phone: string, password: string) => Promise<string | null>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<string | null>;
};

const AUTH_STORAGE_KEY = '@anhuyqa:user';

function normalizePhone(phone: string) {
  return phone.replace(/[\s()-]/g, '').trim();
}

function isValidPhone(phone: string) {
  return /^(?:0\d{9}|\+84\d{9})$/.test(phone);
}

function persistUser(user: User | null) {
  if (!user) {
    return AsyncStorage.removeItem(AUTH_STORAGE_KEY).catch(() => undefined);
  }

  return AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user)).catch(() => undefined);
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    getApiCurrentUser()
      .then(async (currentUser) => {
        if (!isMounted) return;
        setUser(currentUser);
        await persistUser(currentUser);
      })
      .catch(async () => {
        if (!isMounted) return;
        setUser(null);
        await logoutApiUser();
        await persistUser(null);
      })
      .finally(() => {
        if (isMounted) {
          setIsReady(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      isReady,
      async login(phone: string, password: string) {
        const normalizedPhone = normalizePhone(phone);
        if (!normalizedPhone || !password.trim()) {
          return 'Nhập số điện thoại và mật khẩu.';
        }
        if (!isValidPhone(normalizedPhone)) {
          return 'Số điện thoại không hợp lệ.';
        }
        try {
          const response = await loginApiUser(normalizedPhone, password);
          setUser(response.data);
          await persistUser(response.data);
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
        if (!isValidPhone(normalizedPhone)) {
          return 'Số điện thoại không hợp lệ.';
        }
        if (password.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự.';
        try {
          const response = await registerApiUser(name.trim(), normalizedPhone, password);
          setUser(response.data);
          await persistUser(response.data);
          return null;
        } catch (error) {
          return error instanceof Error ? error.message : 'Không thể đăng ký.';
        }
      },
      logout() {
        setUser(null);
        void logoutApiUser();
        persistUser(null);
      },
      async updateUser(data: Partial<User>) {
        if (!user) return 'Chưa đăng nhập.';
        try {
          const response = await updateApiUser({ HoTen: data.name ?? user.name, Email: data.email ?? user.email, DienThoai: data.phone ?? user.phone });
          const updatedUser = { ...user, name: response.HoTen, email: response.Email || '', phone: response.DienThoai || '' };
          setUser(updatedUser);
          await persistUser(updatedUser);
          return null;
        } catch (error) {
          return error instanceof Error ? error.message : 'Không thể cập nhật tài khoản.';
        }
      },
    }),
    [isReady, user]
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
