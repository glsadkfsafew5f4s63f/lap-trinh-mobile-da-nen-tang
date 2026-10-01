INSERT INTO VaiTro (TenVaiTro, MoTa) VALUES
('NHAN_VIEN_BAO_CAO', 'Xem tổng quan và báo cáo hoạt động, chỉ đọc'),
('NHAN_VIEN_SAN_PHAM', 'Quản lý sản phẩm, biến thể, danh mục, thương hiệu và hình ảnh'),
('NHAN_VIEN_DON_HANG', 'Xử lý đơn hàng, trạng thái giao hàng và lịch sử đơn'),
('NHAN_VIEN_TAI_CHINH', 'Theo dõi thanh toán và hóa đơn'),
('NHAN_VIEN_KHACH_HANG', 'Quản lý hồ sơ khách hàng và đánh giá'),
('NHAN_VIEN_KHUYEN_MAI', 'Quản lý voucher và chương trình giảm giá'),
('NHAN_VIEN_KHO', 'Quản lý tồn kho, nhà cung cấp, phiếu nhập và lịch sử kho'),
('NHAN_VIEN_LIEN_HE', 'Tiếp nhận và xử lý liên hệ khách hàng')
ON DUPLICATE KEY UPDATE MoTa = VALUES(MoTa);