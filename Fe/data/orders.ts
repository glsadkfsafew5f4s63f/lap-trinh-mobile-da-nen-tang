export type OrderStatus = 'Chờ xác nhận' | 'Đã xác nhận' | 'Đang giao' | 'Đã giao' | 'Đã hủy';

export type OrderItem = {
  detailId?: number;
  productId: string;
  variantId?: number;
  sku?: string;
  colorIndex?: number;
  sizeIndex?: number;
  color?: string;
  size?: string;
  quantity: number;
  price: number;
};

export type Order = {
  id: string;
  date: string;
  status: OrderStatus;
  payment: string;
  deposit?: number;
  remaining?: number;
  paymentStatus?: string;
  shippingFee: number;
  name: string;
  phone: string;
  address: string;
  items: OrderItem[];
  reviewedProductIds: string[];
};

export const mockOrders: Order[] = [
  {
    id: 'DH001',
    date: '10/09/2026',
    status: 'Chờ xác nhận',
    payment: 'COD',
    shippingFee: 30000,
    name: 'Nguyễn Văn An',
    phone: '0912345678',
    address: 'Số 10 đường Nguyễn Lương Bằng, Phường Thanh Bình, Thành phố Hải Dương',
    items: [
      { productId: '1', colorIndex: 0, sizeIndex: 1, quantity: 1, price: 199000 },
      { productId: '2', colorIndex: 0, sizeIndex: 2, quantity: 1, price: 199000 },
    ],
    reviewedProductIds: [],
  },
  {
    id: 'DH002',
    date: '10/09/2026',
    status: 'Đã xác nhận',
    payment: 'COD',
    shippingFee: 30000,
    name: 'Trần Văn Bình',
    phone: '0923456789',
    address: 'Số 15 đường Cầu Giấy, Dịch Vọng, Cầu Giấy, Hà Nội',
    items: [{ productId: '4', colorIndex: 0, sizeIndex: 0, quantity: 1, price: 299000 }],
    reviewedProductIds: [],
  },
];

export function getOrderTotal(order: Order) {
  return (
    order.items.reduce((sum, item) => sum + item.price * item.quantity, 0) + order.shippingFee
  );
}
