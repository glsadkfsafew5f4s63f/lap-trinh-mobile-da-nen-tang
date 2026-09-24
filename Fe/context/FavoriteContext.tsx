import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { favoriteIds, getProductById, Product } from '../data/products';
import { mockUser } from '../data/user';
import { useAuth } from './AuthContext';

type FavoriteContextValue = {
  ids: string[];
  items: Product[];
  isFavorite: (productId: string) => boolean;
  toggle: (productId: string) => void;
  isLoading: boolean;
  error: string | null;
};

const FAVORITE_STORAGE_KEY = '@anhuyqa:favorites';
const FavoriteContext = createContext<FavoriteContextValue | null>(null);

export function FavoriteProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userKey = user?.phone ?? '';
  const [idsByUser, setIdsByUser] = useState<Record<string, string[]>>({
    [mockUser.phone]: favoriteIds,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    if (!user) {
      setIdsByUser((current) => ({ ...current, [userKey]: [] }));
      return () => {
        active = false;
      };
    }

    AsyncStorage.getItem(FAVORITE_STORAGE_KEY)
      .then((stored) => {
        if (!active) {
          return;
        }

        if (stored) {
          try {
            const parsed = JSON.parse(stored) as Record<string, string[]>;
            setIdsByUser((current) => ({ ...current, [userKey]: parsed[userKey] ?? current[userKey] ?? favoriteIds }));
          } catch {
            setIdsByUser((current) => ({ ...current, [userKey]: current[userKey] ?? favoriteIds }));
          }
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [user, userKey]);

  const ids = idsByUser[userKey] ?? [];

  const value = useMemo(() => {
    const items = ids
      .map((id) => getProductById(id))
      .filter((item): item is Product => Boolean(item));

    return {
      ids,
      items,
      isFavorite(productId: string) {
        return ids.includes(productId);
      },
      isLoading,
      error,
      toggle(productId: string) {
        if (!user || !user.id) {
          setError('Bạn cần đăng nhập để lưu yêu thích.');
          return;
        }

        const nextIds = ids.includes(productId)
          ? ids.filter((id) => id !== productId)
          : [...ids, productId];

        setIdsByUser((allUsers) => ({
          ...allUsers,
          [userKey]: nextIds,
        }));
        setError(null);
        AsyncStorage.setItem(FAVORITE_STORAGE_KEY, JSON.stringify({ ...idsByUser, [userKey]: nextIds }));

      },
    };
  }, [error, ids, isLoading, user, userKey, idsByUser]);

  return <FavoriteContext.Provider value={value}>{children}</FavoriteContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoriteContext);
  if (!context) {
    throw new Error('useFavorites phải dùng trong FavoriteProvider');
  }
  return context;
}
