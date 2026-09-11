import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

import { getProductById, getProductVariantStock, Product } from '../data/products';
import { mockUser } from '../data/user';
import { useAuth } from './AuthContext';

export type CartLine = {
  productId: string;
  colorIndex: number;
  sizeIndex: number;
  quantity: number;
};

export type CartItem = Product & {
  colorIndex: number;
  sizeIndex: number;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  total: number;
  addToCart: (productId: string, colorIndex: number, sizeIndex: number, quantity?: number) => void;
  increase: (productId: string, colorIndex: number, sizeIndex: number) => void;
  decrease: (productId: string, colorIndex: number, sizeIndex: number) => void;
  remove: (productId: string, colorIndex: number, sizeIndex: number) => void;
  clear: () => void;
};

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
  const lines = linesByUser[userKey] ?? [];

  const value = useMemo(() => {
    function updateLines(updater: (current: CartLine[]) => CartLine[]) {
      if (!userKey) {
        return;
      }
      setLinesByUser((current) => ({
        ...current,
        [userKey]: updater(current[userKey] ?? []),
      }));
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

    function addToCart(productId: string, colorIndex: number, sizeIndex: number, quantity = 1) {
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
          return current.map((item) =>
            item.productId === productId &&
            item.colorIndex === colorIndex &&
            item.sizeIndex === sizeIndex
              ? { ...item, quantity: Math.min(stock, item.quantity + quantity) }
              : item
          );
        }
        return [...current, { productId, colorIndex, sizeIndex, quantity: Math.min(stock, quantity) }];
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
    }

    function clear() {
      updateLines(() => []);
    }

    return { items, itemCount, total, addToCart, increase, decrease, remove, clear };
  }, [lines, userKey]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart phải dùng trong CartProvider');
  }
  return context;
}
