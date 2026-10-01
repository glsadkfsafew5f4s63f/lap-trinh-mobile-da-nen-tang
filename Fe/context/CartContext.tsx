import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { getProductById, Product, resolveProductImageUrl } from '../data/products';
import { addCartItemApi, getApiCart, removeCartItemApi, updateCartItemApi } from '../services/api';
import { useAuth } from './AuthContext';

export type CartLine = {
  serverItemId?: number;
  productId: string;
  colorIndex: number;
  sizeIndex: number;
  quantity: number;
  variantId?: number;
  sku?: string;
  unitPrice?: number;
  productSnapshot?: Product;
  openable?: boolean;
};

export type CartItem = Product & {
  colorIndex: number;
  sizeIndex: number;
  quantity: number;
  variantId?: number;
  sku?: string;
  productSnapshot?: Product;
  openable?: boolean;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  total: number;
  addToCart: (productId: string, colorIndex: number, sizeIndex: number, quantity?: number, variantId?: number, sku?: string) => Promise<string | null>;
  increase: (productId: string, colorIndex: number, sizeIndex: number) => Promise<void>;
  decrease: (productId: string, colorIndex: number, sizeIndex: number) => Promise<void>;
  remove: (productId: string, colorIndex: number, sizeIndex: number) => Promise<void>;
  clear: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
};

const CartContext = createContext<CartContextValue | null>(null);

function mapServerCart(items: Awaited<ReturnType<typeof getApiCart>>['items']): CartLine[] {
  return items.map((item) => {
    const productId = String(item.MaSanPham);
    const catalogProduct = getProductById(productId);
    const colorNames = catalogProduct?.colors.map((value) => value.name) || [];
    const sizeNames = catalogProduct?.sizes || [];
    const colorIndex = item.TenMau ? Math.max(0, colorNames.indexOf(item.TenMau)) : 0;
    const sizeIndex = item.TenKichThuoc ? Math.max(0, sizeNames.indexOf(item.TenKichThuoc)) : 0;
    const colors = colorNames.length ? catalogProduct!.colors : item.TenMau ? [{ name: item.TenMau, hex: '#808080' }] : [];
    const sizes = sizeNames.length ? sizeNames : item.TenKichThuoc ? [item.TenKichThuoc] : [];
    const image = resolveProductImageUrl(item.AnhChinh || '');
    const productSnapshot: Product = {
      ...(catalogProduct || {} as Product),
      id: productId,
      sqlId: item.MaSanPham,
      name: item.TenSanPham || catalogProduct?.name || `Sản phẩm #${productId}`,
      price: Number(item.DonGia),
      category: catalogProduct?.category || '',
      brand: catalogProduct?.brand || '',
      description: catalogProduct?.description || '',
      image: catalogProduct?.image || image,
      images: catalogProduct?.images.length ? catalogProduct.images : image ? [image] : [],
      colors,
      sizes,
      stockByVariant: [[Number(item.SoLuongCoTheBan)]],
      variants: catalogProduct?.variants.length ? catalogProduct.variants : [{ id: item.MaBienThe, color: item.TenMau || '', size: item.TenKichThuoc || '', sku: item.SKU, price: Number(item.DonGia), stock: Number(item.SoLuongCoTheBan) }],
      rating: catalogProduct?.rating || 0,
      reviewCount: catalogProduct?.reviewCount || 0,
    };
    return { serverItemId: item.MaChiTietGioHang, productId, colorIndex, sizeIndex, quantity: Number(item.SoLuong), variantId: item.MaBienThe, sku: item.SKU, unitPrice: Number(item.DonGia), productSnapshot, openable: Boolean(catalogProduct) };
  });
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userKey = user?.phone ?? '';
  const [linesByUser, setLinesByUser] = useState<Record<string, CartLine[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refreshCart() {
    const cart = await getApiCart();
    setLinesByUser((current) => ({ ...current, [userKey]: mapServerCart(cart.items) }));
    setError(null);
  }

  useEffect(() => {
    let active = true;

    if (!user) {
      setLinesByUser((current) => ({ ...current, [userKey]: [] }));
      return () => {
        active = false;
      };
    }

    setIsLoading(true);
    getApiCart()
      .then((cart) => {
        if (active) setLinesByUser((current) => ({ ...current, [userKey]: mapServerCart(cart.items) }));
      })
      .catch(() => { if (active) setError('Không thể tải giỏ hàng từ máy chủ.'); })
      .finally(() => { if (active) setIsLoading(false); });

    return () => {
      active = false;
    };
  }, [user, userKey]);

  const lines = linesByUser[userKey] ?? [];

  const value = useMemo(() => {
    const items = lines
      .map((line) => {
        const product = line.productSnapshot || getProductById(line.productId);
        if (!product) {
          return null;
        }
        return { ...product, ...line, price: line.unitPrice ?? product.price };
      })
      .filter((item) => item !== null);

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    async function addToCart(productId: string, colorIndex: number, sizeIndex: number, quantity = 1, variantId?: number, sku?: string) {
      if (!user || !user.id) {
        const message = 'Bạn cần đăng nhập để thêm vào giỏ hàng.';
        setError(message);
        return message;
      }

      const userId = user.id;

      const product = getProductById(productId);
      const selectedVariantId = variantId ?? product?.variants?.find((candidate) => candidate.color === product.colors[colorIndex]?.name && candidate.size === product.sizes[sizeIndex])?.id;
      if (!selectedVariantId) {
        const message = 'Không tìm thấy SKU hợp lệ cho lựa chọn này.';
        setError(message);
        return message;
      }
      try {
        await addCartItemApi(userId, selectedVariantId, quantity);
        await refreshCart();
        return null;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Không thể cập nhật giỏ hàng trên máy chủ.';
        setError(message);
        return message;
      }
    }

    async function increase(productId: string, colorIndex: number, sizeIndex: number) {
      const line = lines.find((item) => item.productId === productId && item.colorIndex === colorIndex && item.sizeIndex === sizeIndex);
      if (!line?.serverItemId) return;
      try { await updateCartItemApi(line.serverItemId, line.quantity + 1); await refreshCart(); }
      catch (error) { setError(error instanceof Error ? error.message : 'Không thể cập nhật số lượng.'); }
    }

    async function decrease(productId: string, colorIndex: number, sizeIndex: number) {
      const line = lines.find((item) => item.productId === productId && item.colorIndex === colorIndex && item.sizeIndex === sizeIndex);
      if (!line?.serverItemId) return;
      try {
        if (line.quantity <= 1) await removeCartItemApi(line.serverItemId);
        else await updateCartItemApi(line.serverItemId, line.quantity - 1);
        await refreshCart();
      } catch (error) { setError(error instanceof Error ? error.message : 'Không thể cập nhật số lượng.'); }
    }

    async function remove(productId: string, colorIndex: number, sizeIndex: number) {
      const line = lines.find((item) => item.productId === productId && item.colorIndex === colorIndex && item.sizeIndex === sizeIndex);
      if (!line?.serverItemId) return;
      try { await removeCartItemApi(line.serverItemId); await refreshCart(); }
      catch (error) { setError(error instanceof Error ? error.message : 'Không thể xóa sản phẩm khỏi giỏ.'); }
    }

    async function clear() {
      setLinesByUser((current) => ({ ...current, [userKey]: [] }));
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
