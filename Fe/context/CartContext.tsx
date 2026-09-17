import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { getProductById, getProductVariantStock, Product } from '../data/products';
import { mockUser } from '../data/user';
import { addCartItemApi, removeCartItemApi } from '../services/api';
import { useAuth } from './AuthContext';

export type CartLine = {
  productId: string;
  colorIndex: number;
  sizeIndex: number;
  quantity: number;
  variantId?: number;
  sku?: string;
};

export type CartItem = Product & {
  colorIndex: number;
  sizeIndex: number;
  quantity: number;
  variantId?: number;
  sku?: string;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  total: number;
  addToCart: (productId: string, colorIndex: number, sizeIndex: number, quantity?: number, variantId?: number, sku?: string) => void;
  increase: (productId: string, colorIndex: number, sizeIndex: number) => void;
  decrease: (productId: string, colorIndex: number, sizeIndex: number) => void;
  remove: (productId: string, colorIndex: number, sizeIndex: number) => void;
  clear: () => void;
  isLoading: boolean;
  error: string | null;
};

const CART_STORAGE_KEY = '@anhuyqa:cart';
const CartContext = createContext<CartContextValue | null>(null);

const initialLines: CartLine[] = [
  { productId: '1', colorIndex: 0, sizeIndex: 1, quantity: 1 },
  { productId: '2', colorIndex: 0, sizeIndex: 2, quantity: 1 },
];

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userKey = user?.phone ?? '';
  const [linesByUser, setLinesByUser] = useState<Record<string, CartLine[]>>({
    [mockUser.phone]: initialLines,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    if (!user) {
      setLinesByUser((current) => ({ ...current, [userKey]: [] }));
      return () => {
        active = false;
      };
    }

    setIsLoading(true);
    AsyncStorage.getItem(CART_STORAGE_KEY)
      .then((stored) => {
        if (!active || !stored) {
          return;
        }

        try {
          const parsed = JSON.parse(stored) as Record<string, CartLine[]>;
          setLinesByUser((current) => ({ ...current, [userKey]: parsed[userKey] ?? current[userKey] ?? initialLines }));
        } catch {
          setLinesByUser((current) => ({ ...current, [userKey]: current[userKey] ?? initialLines }));
        }
      })
      .catch(() => {
        setLinesByUser((current) => ({ ...current, [userKey]: current[userKey] ?? initialLines }));
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

  const lines = linesByUser[userKey] ?? [];

  const value = useMemo(() => {
    function updateLines(updater: (current: CartLine[]) => CartLine[]) {
      if (!userKey) {
        return;
      }
      setLinesByUser((current) => {
        const next = updater(current[userKey] ?? []);
        AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ ...current, [userKey]: next }));
        return { ...current, [userKey]: next };
      });
    }

    const items = lines
      .map((line) => {
        const product = getProductById(line.productId);
        if (!product) {
          return null;
        }
        return { ...product, ...line };
      })
      .filter((item) => item !== null);

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    function addToCart(productId: string, colorIndex: number, sizeIndex: number, quantity = 1, variantId?: number, sku?: string) {
      if (!user || !user.id) {
        setError('Bạn cần đăng nhập để thêm vào giỏ hàng.');
        return;
      }

      const userId = user.id;

      updateLines((current) => {
        const product = getProductById(productId);
        const stock = product ? getProductVariantStock(product, colorIndex, sizeIndex) : 0;
        if (stock === 0) {
          return current;
        }
        const found = current.find(
          (item) =>
            item.productId === productId &&
            item.colorIndex === colorIndex &&
            item.sizeIndex === sizeIndex
        );
        if (found) {
          const next = current.map((item) =>
            item.productId === productId &&
            item.colorIndex === colorIndex &&
            item.sizeIndex === sizeIndex
              ? { ...item, quantity: Math.min(stock, item.quantity + quantity), variantId, sku }
              : item
          );
          addCartItemApi(userId, productId, quantity).catch(() => {
            setError('Không thể đồng bộ giỏ hàng với server, dữ liệu local đã được lưu.');
          });
          return next;
        }
        const next = [{ productId, colorIndex, sizeIndex, quantity: Math.min(stock, quantity), variantId, sku }, ...current];
        addCartItemApi(userId, productId, quantity).catch(() => {
          setError('Không thể đồng bộ giỏ hàng với server, dữ liệu local đã được lưu.');
        });
        return next;
      });
    }

    function increase(productId: string, colorIndex: number, sizeIndex: number) {
      updateLines((current) =>
        current.map((item) =>
          item.productId === productId &&
          item.colorIndex === colorIndex &&
          item.sizeIndex === sizeIndex
            ? {
                ...item,
                quantity: Math.min(
                  getProductById(productId)
                    ? getProductVariantStock(getProductById(productId)!, colorIndex, sizeIndex)
                    : item.quantity,
                  item.quantity + 1
                ),
              }
            : item
        )
      );
    }

    function decrease(productId: string, colorIndex: number, sizeIndex: number) {
      updateLines((current) =>
        current
          .map((item) =>
            item.productId === productId &&
            item.colorIndex === colorIndex &&
            item.sizeIndex === sizeIndex
              ? { ...item, quantity: item.quantity - 1 }
              : item
          )
          .filter((item) => item.quantity > 0)
      );
    }

    function remove(productId: string, colorIndex: number, sizeIndex: number) {
      updateLines((current) =>
        current.filter(
          (item) =>
            !(
              item.productId === productId &&
              item.colorIndex === colorIndex &&
              item.sizeIndex === sizeIndex
            )
        )
      );
      if (user && user.id) {
        removeCartItemApi(Number(productId)).catch(() => {
          setError('Không thể xóa mục giỏ trên server.');
        });
      }
    }

    function clear() {
      updateLines(() => []);
      setError(null);
    }

    return { items, itemCount, total, addToCart, increase, decrease, remove, clear, isLoading, error };
  }, [error, isLoading, lines, user, userKey]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart phải dùng trong CartProvider');
  }
  return context;
}
