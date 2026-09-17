import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { getOrderTotal, mockOrders, Order, OrderItem } from '../data/orders';
import { mockUser } from '../data/user';
import { getProductById } from '../data/products';
import { createOrderApi, getApiOrders } from '../services/api';
import { useAuth } from './AuthContext';

type NewOrderInput = {
  name: string;
  phone: string;
  address: string;
  items: OrderItem[];
  deposit: number;
  remaining: number;
};

type OrderContextValue = {
  orders: Order[];
  getOrderById: (id: string) => Order | undefined;
  addOrder: (input: NewOrderInput) => Order;
  markReviewed: (orderId: string, productId: string) => void;
  isLoading: boolean;
  error: string | null;
};

const ORDER_STORAGE_KEY = '@anhuyqa:orders';
const OrderContext = createContext<OrderContextValue | null>(null);

export function OrderProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userKey = user?.phone ?? '';
  const [ordersByUser, setOrdersByUser] = useState<Record<string, Order[]>>({
    [mockUser.phone]: mockOrders,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    if (!user || !user.id) {
      return () => {
        active = false;
      };
    }

    setIsLoading(true);
    AsyncStorage.getItem(ORDER_STORAGE_KEY)
      .then((stored) => {
        if (!active) {
          return;
        }

        if (stored) {
          try {
            const parsed = JSON.parse(stored) as Record<string, Order[]>;
            setOrdersByUser((current) => ({ ...current, [userKey]: parsed[userKey] ?? current[userKey] ?? mockOrders }));
          } catch {
            setOrdersByUser((current) => ({ ...current, [userKey]: current[userKey] ?? mockOrders }));
          }
        }
      })
      .catch(() => {
        setOrdersByUser((current) => ({ ...current, [userKey]: current[userKey] ?? mockOrders }));
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    getApiOrders(user.id)
      .then((rows) => {
        if (!active) {
          return;
        }
        if (rows.length > 0) {
          const mapped: Order[] = rows.map((row, index) => ({
            id: row.MaDonHang ? `DH${String(row.MaDonHang).padStart(3, '0')}` : `DH${String(index + 1).padStart(3, '0')}`,
            date: row.NgayDat ? new Date(row.NgayDat).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
            status: row.TrangThai === 'DaXacNhan'
              ? 'Đã xác nhận'
              : row.TrangThai === 'DangGiao'
                ? 'Đang giao'
                : row.TrangThai === 'DaGiao'
                  ? 'Đã giao'
                  : row.TrangThai === 'DaHuy'
                    ? 'Đã hủy'
                    : 'Chờ xác nhận',
            payment: 'COD',
            deposit: Number(row.TienCoc || 0),
            remaining: Number(row.TienConLai || 0),
            paymentStatus: row.TrangThaiThanhToan || 'ChuaCoc',
            name: row.HoTenNguoiNhan,
            phone: row.SoDienThoaiNguoiNhan,
            address: row.DiaChiGiaoHang,
            shippingFee: Number(row.PhiVanChuyen || 30000),
            items: (row.items ?? []).map((item) => ({
              productId: String(item.MaSanPham),
              variantId: item.MaBienThe,
              sku: item.SKU,
              color: item.Mau,
              size: item.KichThuoc,
              quantity: Number(item.SoLuong),
              price: Number(item.DonGia),
            })),
            reviewedProductIds: [],
          }));
          setOrdersByUser((current) => ({ ...current, [userKey]: mapped.length > 0 ? mapped : current[userKey] ?? mockOrders }));
        }
      })
      .catch(() => {
        setError('Không kết nối được server đơn hàng, đang dùng dữ liệu local.');
      });

    return () => {
      active = false;
    };
  }, [user, userKey]);

  const orders = ordersByUser[userKey] ?? [];

  const value = useMemo(
    () => ({
      orders,
      isLoading,
      error,
      getOrderById(id: string) {
        return orders.find((item) => item.id === id);
      },
      addOrder(input: NewOrderInput) {
        const order: Order = {
          id: `DH${String(orders.length + 4).padStart(3, '0')}`,
          date: new Date().toLocaleDateString('vi-VN'),
          status: 'Chờ xác nhận',
          payment: 'COD',
          name: input.name,
          phone: input.phone,
          address: input.address,
          shippingFee: 30000,
          items: input.items,
          reviewedProductIds: [],
        };

        if (user && user.id) {
          createOrderApi({
            MaNguoiDung: user.id,
            HoTenNguoiNhan: input.name,
            SoDienThoaiNguoiNhan: input.phone,
            DiaChiGiaoHang: input.address,
            TongTien: input.items.reduce((sum, item) => sum + item.price * item.quantity, 0) + 30000,
            PhiVanChuyen: 30000,
            PhuongThucThanhToan: 'Coc 20% + COD',
            TienCoc: input.deposit,
            TienConLai: input.remaining,
            TrangThaiThanhToan: 'DaCoc',
            items: input.items.map((item) => {
              const product = getProductById(item.productId);
              const variant = product?.variants?.find(
                (candidate) => candidate.color === item.color && candidate.size === item.size
              );
              return {
                variantId: item.variantId ?? variant?.id ?? 0,
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
                color: item.color ?? variant?.color ?? '',
                size: item.size ?? variant?.size ?? '',
                name: product?.name ?? item.productId,
              };
            }),
          }).catch(() => {
            setError('Tạo đơn hàng chưa đồng bộ với server, dữ liệu local đã được lưu.');
          });
        }

        if (userKey) {
          setOrdersByUser((allUsers) => {
            const next = [order, ...(allUsers[userKey] ?? [])];
            AsyncStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify({ ...allUsers, [userKey]: next }));
            return { ...allUsers, [userKey]: next };
          });
        }
        return order;
      },
      markReviewed(orderId: string, productId: string) {
        if (userKey) {
          setOrdersByUser((allUsers) => ({
            ...allUsers,
            [userKey]: (allUsers[userKey] ?? []).map((order) =>
              order.id === orderId && !order.reviewedProductIds.includes(productId)
                ? {
                    ...order,
                    reviewedProductIds: [...order.reviewedProductIds, productId],
                  }
                : order
            ),
          }));
        }
      },
    }),
    [error, isLoading, orders, user, userKey]
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders phải dùng trong OrderProvider');
  }
  return context;
}

export { getOrderTotal };
