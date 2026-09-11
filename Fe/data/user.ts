export type User = {
  id?: number;
  name: string;
  email: string;
  phone: string;
  address: string;
};

export const mockUser: User = {
  name: 'Nguyễn Văn A',
  email: 'nguyenvana@shop.local',
  phone: '0901234567',
  address: '123 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP.HCM',
};
