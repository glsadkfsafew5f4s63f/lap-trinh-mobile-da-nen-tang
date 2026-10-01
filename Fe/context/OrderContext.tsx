import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { getOrderTotal, Order, OrderItem } from '../data/orders';
import { cancelOrderApi, createOrderApi, getApiOrders, OrderApiRecord } from '../services/api';
import { useAuth } from './AuthContext';

type NewOrderInput = {
  addressId?: number;
  name: string;
  phone: string;
  address: string;
  items: OrderItem[];
  paymentMethod: string;
  voucherCode?: string;
};

type OrderContextValue = {
  orders: Order[];
  getOrderById: (id: string) => Order | undefined;
  addOrder: (input: NewOrderInput) => Promise<Order>;
  cancelOrder: (id: string) => Promise<string | null>;
  refreshOrders: () => Promise<void>;
  markReviewed: (orderId: string, productId: string) => void;
  isLoading: boolean;
  error: string | null;
};

const OrderContext = createContext<OrderContextValue | null>(null);

export function mapApiOrder(row: OrderApiRecord): Order {
  return {
    id: row.MaDonHangCode,
    serverId: row.MaDonHang,
    date: row.NgayDat ? new Date(row.NgayDat).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
    status: row.TrangThaiDonHang === 'DA_XAC_NHAN'
      ? 'Đã xác nhận'
      : row.TrangThaiDonHang === 'DANG_CHUAN_BI' || row.TrangThaiDonHang === 'DANG_GIAO'
        ? 'Đang giao'
        : row.TrangThaiDonHang === 'DA_GIAO'
          ? 'Đã giao'
          : row.TrangThaiDonHang === 'DA_HUY'
                ? 'Đã hủy'
                : row.TrangThaiDonHang === 'DA_HOAN_TIEN'
                  ? 'Đã hoàn tiền'
            : 'Chờ xác nhận',
        statusCode: row.TrangThaiDonHang,
              payment: row.PhuongThuc || row.payments?.[0]?.PhuongThuc || 'Chưa xác định',
              paymentStatus: row.payments?.[0]?.TrangThai || row.TrangThaiThanhToan,
    name: row.TenNguoiNhan || '',
    phone: row.SoDienThoaiNhan || '',
    address: row.DiaChiGiaoHang || '',
    shippingFee: Number(row.PhiGiaoHang || 0),
    subtotal: Number(row.TongTien || 0),
    discount: Number(row.GiamGia || 0),
    total: Number(row.ThanhTien || 0),
    items: (row.items ?? []).map((item) => ({
      detailId: item.MaChiTietDonHang,
      productId: String(item.MaSanPham ?? ''),
      name: item.TenSanPham,
      variantId: item.MaBienThe ?? undefined,
      sku: item.SKU,
      color: item.TenMau,
      size: item.TenKichThuoc,
      quantity: Number(item.SoLuong),
      price: Number(item.DonGia),
    })),
    reviewedProductIds: (row.items ?? []).filter((item) => Boolean(item.DaDanhGia)).map((item) => String(item.MaSanPham ?? '')),
  };
}

export function OrderProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userKey = user?.phone ?? '';
  const [ordersByUser, setOrdersByUser] = useState<Record<string, Order[]>>({});
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
    getApiOrders()
      .then((rows) => {
        if (!active) {
          return;
        }
        setOrdersByUser((current) => ({ ...current, [userKey]: rows.map(mapApiOrder) }));
      })
      .catch(() => {
        if (active) setError('Không kết nối được máy chủ đơn hàng.');
      })
      .finally(() => { if (active) setIsLoading(false); });

    return () => {
      active = false;
    };
  }, [user, userKey]);

  const orders = ordersByUser[userKey] ?? [];

  async function refreshOrders() {
    if (!userKey) return;
    const rows = await getApiOrders();
    setOrdersByUser((current) => ({ ...current, [userKey]: rows.map(mapApiOrder) }));
  }

  const value = useMemo(
    () => ({
      orders,
      isLoading,
      error,
      refreshOrders,
      getOrderById(id: string) {
        return orders.find((item) => item.id === id || String(item.serverId) === id);
      },
      async cancelOrder(id: string) {
        const order = orders.find((item) => item.id === id || String(item.serverId) === id);
        if (!order?.serverId) return 'Không tìm thấy mã đơn hàng trên máy chủ.';
        try {
          await cancelOrderApi(order.serverId);
          await refreshOrders();
          return null;
        } catch (error) {
          return error instanceof Error ? error.message : 'Không thể hủy đơn hàng.';
        }
      },
      async addOrder(input: NewOrderInput) {
        const order: Order = {
          id: '',
          date: new Date().toLocaleDateString('vi-VN'),
          status: 'Chờ xác nhận',
          payment: input.paymentMethod,
          paymentStatus: 'CHUA_THANH_TOAN',
          name: input.name,
          phone: input.phone,
          address: input.address,
          shippingFee: 30000,
          items: input.items,
          reviewedProductIds: [],
        };

        if (!user?.id) throw new Error('Vui lòng đăng nhập trước khi đặt hàng.');
        if (!input.addressId) throw new Error('Vui lòng chọn hoặc lưu địa chỉ giao hàng.');
        const response = await createOrderApi({ MaDiaChi: input.addressId, PhuongThuc: input.paymentMethod, MaGiamGiaCode: input.voucherCode });
        if (!response.data.MaDonHang) throw new Error('Server không trả về mã đơn hàng.');
        order.id = response.data.MaDonHangCode;
        order.serverId = response.data.MaDonHang;
        order.subtotal = response.data.TongTien;
        order.discount = response.data.GiamGia;
        order.shippingFee = response.data.PhiGiaoHang;
        order.total = response.data.ThanhTien;

        if (userKey) {
          setOrdersByUser((allUsers) => {
            const next = [order, ...(allUsers[userKey] ?? [])];
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
