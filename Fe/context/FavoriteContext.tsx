import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

import { favoriteIds, getProductById, Product } from '../data/products';
import { mockUser } from '../data/user';
import { useAuth } from './AuthContext';

type FavoriteContextValue = {
  ids: string[];
  items: Product[];
  isFavorite: (productId: string) => boolean;
  toggle: (productId: string) => void;
};

const FavoriteContext = createContext<FavoriteContextValue | null>(null);

export function FavoriteProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userKey = user?.phone ?? '';
  const [idsByUser, setIdsByUser] = useState<Record<string, string[]>>({
    [mockUser.phone]: favoriteIds,
  });
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
      toggle(productId: string) {
        if (!userKey) {
          return;
        }
        setIdsByUser((allUsers) => {
          const current = allUsers[userKey] ?? [];
          return {
            ...allUsers,
            [userKey]: current.includes(productId)
              ? current.filter((id) => id !== productId)
              : [...current, productId],
          };
        });
      },
    };
  }, [ids, userKey]);

  return <FavoriteContext.Provider value={value}>{children}</FavoriteContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoriteContext);
  if (!context) {
    throw new Error('useFavorites phải dùng trong FavoriteProvider');
  }
  return context;
}
