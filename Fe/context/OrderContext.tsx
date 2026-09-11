import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

import { getOrderTotal, mockOrders, Order, OrderItem } from '../data/orders';
import { mockUser } from '../data/user';
import { useAuth } from './AuthContext';

type NewOrderInput = {
  name: string;
  phone: string;
  address: string;
  items: OrderItem[];
};

type OrderContextValue = {
  orders: Order[];
  getOrderById: (id: string) => Order | undefined;
  addOrder: (input: NewOrderInput) => Order;
  markReviewed: (orderId: string, productId: string) => void;
};

const OrderContext = createContext<OrderContextValue | null>(null);

export function OrderProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userKey = user?.phone ?? '';
  const [ordersByUser, setOrdersByUser] = useState<Record<string, Order[]>>({
    [mockUser.phone]: mockOrders,
  });
  const orders = ordersByUser[userKey] ?? [];

  const value = useMemo(
    () => ({
      orders,
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
        if (userKey) {
          setOrdersByUser((allUsers) => ({
            ...allUsers,
            [userKey]: [order, ...(allUsers[userKey] ?? [])],
          }));
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
    [orders, userKey]
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
