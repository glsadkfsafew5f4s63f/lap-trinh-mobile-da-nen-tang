import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { User } from '../data/user';
import { AUTH_TOKEN_STORAGE_KEY, loginApiUser, registerApiUser } from '../services/api';

type AuthContextValue = {
  user: User | null;
  isReady: boolean;
  login: (phone: string, password: string) => Promise<string | null>;
  register: (name: string, phone: string, password: string) => Promise<string | null>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
};

const AUTH_STORAGE_KEY = '@anhuyqa:user';

function normalizePhone(phone: string) {
  return phone.replace(/[\s()-]/g, '').trim();
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

    Promise.all([
      AsyncStorage.getItem(AUTH_STORAGE_KEY),
      AsyncStorage.getItem(AUTH_TOKEN_STORAGE_KEY),
    ])
      .then(([storedUser, storedToken]) => {
        if (!isMounted) {
          return;
        }

        if (storedUser && storedToken) {
          try {
            setUser(JSON.parse(storedUser) as User);
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
          void AsyncStorage.multiRemove([AUTH_STORAGE_KEY, AUTH_TOKEN_STORAGE_KEY]);
        }
      })
      .catch(() => undefined)
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
        if (!/^((\+84)|0)\d{9,10}$/.test(normalizedPhone)) {
          return 'Số điện thoại không hợp lệ.';
        }
        try {
          const response = await loginApiUser(normalizedPhone, password);
          await AsyncStorage.setItem(AUTH_TOKEN_STORAGE_KEY, response.token);
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
        if (!/^((\+84)|0)\d{9,10}$/.test(normalizedPhone)) {
          return 'Số điện thoại không hợp lệ.';
        }
        try {
          const response = await registerApiUser(name.trim(), normalizedPhone, password);
          await AsyncStorage.setItem(AUTH_TOKEN_STORAGE_KEY, response.token);
          setUser(response.data);
          await persistUser(response.data);
          return null;
        } catch (error) {
          return error instanceof Error ? error.message : 'Không thể đăng ký.';
        }
      },
      logout() {
        setUser(null);
        void AsyncStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
        persistUser(null);
      },
      updateUser(data: Partial<User>) {
        setUser((current) => {
          if (!current) {
            return current;
          }

          const updatedUser = { ...current, ...data };
          void persistUser(updatedUser);
          return updatedUser;
        });
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
