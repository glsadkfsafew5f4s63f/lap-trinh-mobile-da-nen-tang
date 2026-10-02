const db = require('../common/db');

const activeStatuses = ['CHO_DUYET', 'DA_DUYET', 'DA_NHAN_HANG'];
const statusTransitions = {
    CHO_DUYET: ['DA_DUYET', 'TU_CHOI'],
    DA_DUYET: ['DA_NHAN_HANG'],
    DA_NHAN_HANG: [],
    TU_CHOI: [],
    DA_HOAN_TIEN: [],
};

exports.createForCustomer = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const reason = String(req.body.LyDo || '').trim();
        if (!reason || reason.length > 500) throw new Error('Nhập lý do trả hàng (tối đa 500 ký tự).');
        await connection.beginTransaction();
        const [[order]] = await connection.query(
            'SELECT * FROM DonHang WHERE MaDonHang=? AND MaNguoiDung=? FOR UPDATE',
            [req.params.orderId, req.user.id],
        );
        if (!order) throw new Error('Không tìm thấy đơn hàng.');
        if (order.TrangThaiDonHang !== 'DA_GIAO') throw new Error('Chỉ gửi yêu cầu trả hàng cho đơn đã giao.');
        if (order.TrangThaiThanhToan !== 'DA_THANH_TOAN') throw new Error('Đơn hàng chưa được xác nhận đã thanh toán.');

        const [[payment]] = await connection.query(
            'SELECT TrangThai FROM ThanhToan WHERE MaDonHang=? ORDER BY LanThu DESC LIMIT 1 FOR UPDATE',
            [order.MaDonHang],
        );
        if (!payment || payment.TrangThai !== 'THANH_CONG') throw new Error('Giao dịch chưa thanh toán thành công.');
        const [existing] = await connection.query(
            'SELECT MaYeuCauTraHang FROM YeuCauTraHang WHERE MaDonHang=? AND TrangThai IN (?) FOR UPDATE',
            [order.MaDonHang, activeStatuses],
        );
        if (existing.length) throw new Error('Đơn hàng đang có yêu cầu trả hàng cần xử lý.');

        const [result] = await connection.query(
            `INSERT INTO YeuCauTraHang(MaDonHang,MaNguoiYeuCau,LyDo)
             VALUES(?,?,?)`,
            [order.MaDonHang, req.user.id, reason],
        );
        await connection.commit();
        res.status(201).json({
            success: true,
            data: { MaYeuCauTraHang: result.insertId, TrangThai: 'CHO_DUYET', LyDo: reason },
            message: 'Đã gửi yêu cầu trả hàng. Cửa hàng sẽ xem xét yêu cầu.',
        });
    } catch (error) {
        await connection.rollback();
        res.status(400).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
};

exports.getForCustomer = async (req, res) => {
    try {
        const [[order]] = await db.query(
            'SELECT MaDonHang FROM DonHang WHERE MaDonHang=? AND MaNguoiDung=?',
            [req.params.orderId, req.user.id],
        );
        if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng.' });
        const [[request]] = await db.query(
            'SELECT * FROM YeuCauTraHang WHERE MaDonHang=? ORDER BY MaYeuCauTraHang DESC LIMIT 1',
            [order.MaDonHang],
        );
        res.json({ success: true, data: request || null });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.listForAdmin = async (_req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT r.*,dh.MaDonHangCode,dh.ThanhTien,dh.TrangThaiDonHang,dh.TrangThaiThanhToan,
                    nd.HoTen AS TenKhachHang,nd.DienThoai,
                    (SELECT t.PhuongThuc FROM ThanhToan t WHERE t.MaDonHang=dh.MaDonHang ORDER BY t.LanThu DESC LIMIT 1) AS PhuongThuc
             FROM YeuCauTraHang r
             JOIN DonHang dh ON dh.MaDonHang=r.MaDonHang
             JOIN NguoiDung nd ON nd.MaNguoiDung=r.MaNguoiYeuCau
             ORDER BY CASE r.TrangThai
                WHEN 'CHO_DUYET' THEN 0 WHEN 'DA_DUYET' THEN 1 WHEN 'DA_NHAN_HANG' THEN 2 ELSE 3 END,
                r.NgayTao DESC`,
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateStatus = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const nextStatus = String(req.body.TrangThai || '');
        const note = String(req.body.GhiChuXuLy || '').trim().slice(0, 500) || null;
        await connection.beginTransaction();
        const [[request]] = await connection.query(
            'SELECT * FROM YeuCauTraHang WHERE MaYeuCauTraHang=? FOR UPDATE',
            [req.params.id],
        );
        if (!request) throw new Error('Không tìm thấy yêu cầu trả hàng.');
        if (!statusTransitions[request.TrangThai]?.includes(nextStatus)) {
            throw new Error(`Không thể chuyển yêu cầu từ ${request.TrangThai} sang ${nextStatus}.`);
        }
        const receivedAt = nextStatus === 'DA_NHAN_HANG' ? 'NOW()' : 'NgayNhanHang';
        await connection.query(
            `UPDATE YeuCauTraHang SET TrangThai=?,GhiChuXuLy=?,MaNguoiXuLy=?,
             NgayNhanHang=${receivedAt} WHERE MaYeuCauTraHang=?`,
            [nextStatus, note, req.user.id, request.MaYeuCauTraHang],
        );
        await connection.commit();
        res.json({ success: true, message: 'Đã cập nhật yêu cầu trả hàng.' });
    } catch (error) {
        await connection.rollback();
        res.status(400).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
};
