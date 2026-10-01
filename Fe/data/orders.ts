export type OrderStatus = 'Chờ xác nhận' | 'Đã xác nhận' | 'Đang giao' | 'Đã giao' | 'Đã hủy' | 'Đã hoàn tiền';

export type OrderItem = {
  detailId?: number;
  productId: string;
  variantId?: number;
  sku?: string;
  name?: string;
  colorIndex?: number;
  sizeIndex?: number;
  color?: string;
  size?: string;
  quantity: number;
  price: number;
};

export type Order = {
  id: string;
  serverId?: number;
  date: string;
  status: OrderStatus;
  statusCode?: string;
  payment: string;
  paymentStatus?: string;
  shippingFee: number;
  subtotal?: number;
  discount?: number;
  total?: number;
  name: string;
  phone: string;
  address: string;
  items: OrderItem[];
  reviewedProductIds: string[];
};

export function getOrderTotal(order: Order) {
  return order.total ?? (
    order.items.reduce((sum, item) => sum + item.price * item.quantity, 0) + order.shippingFee
  );
}
