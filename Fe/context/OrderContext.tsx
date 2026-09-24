import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { getOrderTotal, mockOrders, Order, OrderItem } from '../data/orders';
import { mockUser } from '../data/user';
import { createOrderApi, getApiOrders, OrderApiRecord } from '../services/api';
import { useAuth } from './AuthContext';

type NewOrderInput = {
  addressId?: number;
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
  addOrder: (input: NewOrderInput) => Promise<Order>;
  markReviewed: (orderId: string, productId: string) => void;
  isLoading: boolean;
  error: string | null;
};

const ORDER_STORAGE_KEY = '@anhuyqa:orders';
const OrderContext = createContext<OrderContextValue | null>(null);

function mapApiOrder(row: OrderApiRecord, index: number): Order {
  return {
    id: row.MaDonHang ? `DH${String(row.MaDonHang).padStart(3, '0')}` : `DH${String(index + 1).padStart(3, '0')}`,
    date: row.NgayDat ? new Date(row.NgayDat).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
    status: row.TrangThaiDonHang === 'DA_XAC_NHAN'
      ? 'Đã xác nhận'
      : row.TrangThaiDonHang === 'DANG_GIAO'
        ? 'Đang giao'
        : row.TrangThaiDonHang === 'DA_GIAO'
          ? 'Đã giao'
          : row.TrangThaiDonHang === 'DA_HUY'
            ? 'Đã hủy'
            : 'Chờ xác nhận',
    payment: 'COD',
    deposit: 0,
    remaining: Number(row.ThanhTien || 0),
    paymentStatus: row.TrangThaiThanhToan || 'ChuaCoc',
    name: row.TenNguoiNhan || '',
    phone: row.SoDienThoaiNhan || '',
    address: row.DiaChiGiaoHang || '',
    shippingFee: Number(row.PhiGiaoHang || 0),
    items: (row.items ?? []).map((item) => ({
      detailId: item.MaChiTietDonHang,
      productId: String(item.MaSanPham),
      variantId: item.MaBienThe,
      sku: item.SKU,
      color: item.TenMau,
      size: item.TenKichThuoc,
      quantity: Number(item.SoLuong),
      price: Number(item.DonGia),
    })),
    reviewedProductIds: [],
  };
}

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

    getApiOrders()
      .then((rows) => {
        if (!active) {
          return;
        }
        if (rows.length > 0) {
          const mapped = rows.map(mapApiOrder);
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
      async addOrder(input: NewOrderInput) {
        const order: Order = {
          id: `DH${String(orders.length + 4).padStart(3, '0')}`,
          date: new Date().toLocaleDateString('vi-VN'),
          status: 'Chờ xác nhận',
          payment: 'Cọc 20% + COD',
          deposit: input.deposit,
          remaining: input.remaining,
          paymentStatus: 'ChuaCoc',
          name: input.name,
          phone: input.phone,
          address: input.address,
          shippingFee: 30000,
          items: input.items,
          reviewedProductIds: [],
        };

        if (user && user.id) {
          const response = await createOrderApi({ MaDiaChi: input.addressId, userId: user.id, name: input.name, phone: input.phone, address: input.address, PhuongThuc: 'COD', PhiGiaoHang: 30000 }).catch(() => {
            setError('Tạo đơn hàng chưa đồng bộ với server, dữ liệu local đã được lưu.');
            return null;
          });
          if (response?.data?.MaDonHang) {
            order.id = `DH${String(response.data.MaDonHang).padStart(3, '0')}`;
          }
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
