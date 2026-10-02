const crypto = require('crypto');
const db = require('../common/db');
const momo = require('./momo');

const cancellableStatuses = ['CHO_XAC_NHAN', 'DA_XAC_NHAN', 'DANG_CHUAN_BI'];

async function writeHistory(connection, orderId, oldStatus, newStatus, userId, note) {
    await connection.query(
        `INSERT INTO LichSuDonHang(MaDonHang,TrangThaiCu,TrangThaiMoi,MaNguoiThayDoi,GhiChu)
         VALUES(?,?,?,?,?)`,
        [orderId, oldStatus || null, newStatus, userId || null, note],
    );
}

async function releaseReservedStock(connection, orderId, userId, note) {
    const [items] = await connection.query(
        `SELECT ctdh.MaBienThe,ctdh.SoLuong,bt.SoLuongTon,bt.SoLuongTamGiu
         FROM ChiTietDonHang ctdh
         JOIN BienTheSanPham bt ON bt.MaBienThe=ctdh.MaBienThe
         WHERE ctdh.MaDonHang=? AND ctdh.MaBienThe IS NOT NULL FOR UPDATE`,
        [orderId],
    );
    for (const item of items) {
        const quantity = Number(item.SoLuong);
        if (Number(item.SoLuongTamGiu) < quantity) throw new Error('Số lượng tồn giữ không đủ để hủy đơn.');
        await connection.query(
            'UPDATE BienTheSanPham SET SoLuongTamGiu=SoLuongTamGiu-? WHERE MaBienThe=?',
            [quantity, item.MaBienThe],
        );
        await connection.query(
            `INSERT INTO LichSuTonKho(MaBienThe,LoaiGiaoDich,SoLuongThayDoi,TonTruoc,TonSau,TamGiuTruoc,TamGiuSau,MaDonHang,MaNguoiThucHien,LyDo)
             VALUES(?,?,?,?,?,?,?,?,?,?)`,
            [item.MaBienThe, 'HUY_GIU_HANG', -quantity, item.SoLuongTon, item.SoLuongTon, item.SoLuongTamGiu, Number(item.SoLuongTamGiu) - quantity, orderId, userId || null, note],
        );
    }
}

async function restockReturnedItems(connection, orderId, userId, note) {
    const [items] = await connection.query(
        `SELECT ctdh.MaBienThe,ctdh.SoLuong,bt.SoLuongTon,bt.SoLuongTamGiu
         FROM ChiTietDonHang ctdh
         JOIN BienTheSanPham bt ON bt.MaBienThe=ctdh.MaBienThe
         WHERE ctdh.MaDonHang=? AND ctdh.MaBienThe IS NOT NULL FOR UPDATE`,
        [orderId],
    );
    for (const item of items) {
        const quantity = Number(item.SoLuong);
        await connection.query(
            `UPDATE BienTheSanPham
             SET SoLuongTon=SoLuongTon+?,SoLuongDaBan=GREATEST(SoLuongDaBan-?,0)
             WHERE MaBienThe=?`,
            [quantity, quantity, item.MaBienThe],
        );
        await connection.query(
            `INSERT INTO LichSuTonKho(MaBienThe,LoaiGiaoDich,SoLuongThayDoi,TonTruoc,TonSau,TamGiuTruoc,TamGiuSau,MaDonHang,MaNguoiThucHien,LyDo)
             VALUES(?,?,?,?,?,?,?,?,?,?)`,
            [item.MaBienThe, 'HOAN_HANG', quantity, item.SoLuongTon, Number(item.SoLuongTon) + quantity, item.SoLuongTamGiu, item.SoLuongTamGiu, orderId, userId || null, note],
        );
    }
}

async function restoreVoucherUsage(connection, order) {
    if (!order.MaGiamGia || Number(order.VoucherDaHoanLai)) return;
    if (order.MaNguoiDung) {
        await connection.query(
            `UPDATE MaGiamGiaNguoiDung
             SET SoLanDaSuDung=CASE WHEN SoLanDaSuDung>0 THEN SoLanDaSuDung-1 ELSE 0 END
             WHERE MaGiamGia=? AND MaNguoiDung=?`,
            [order.MaGiamGia, order.MaNguoiDung],
        );
    }
    await connection.query(
        'UPDATE MaGiamGia SET SoLuongDaSuDung=CASE WHEN SoLuongDaSuDung>0 THEN SoLuongDaSuDung-1 ELSE 0 END WHERE MaGiamGia=?',
        [order.MaGiamGia],
    );
    await connection.query(
        'UPDATE DonHang SET VoucherDaHoanLai=1 WHERE MaDonHang=?',
        [order.MaDonHang],
    );
}

async function finalizeRefund(refundId, providerTransactionId) {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [[refundReference]] = await connection.query(
            'SELECT MaDonHang FROM YeuCauHoanTien WHERE MaHoanTien=?',
            [refundId],
        );
        if (!refundReference) throw new Error('Không tìm thấy yêu cầu hoàn tiền.');
        const [[order]] = await connection.query(
            'SELECT * FROM DonHang WHERE MaDonHang=? FOR UPDATE',
            [refundReference.MaDonHang],
        );
        if (!order) throw new Error('Không tìm thấy đơn hàng.');
        const [[refund]] = await connection.query(
            'SELECT * FROM YeuCauHoanTien WHERE MaHoanTien=? FOR UPDATE',
            [refundId],
        );
        if (!refund) throw new Error('Không tìm thấy yêu cầu hoàn tiền.');
        if (refund.TrangThai === 'THANH_CONG') {
            await connection.rollback();
            return;
        }
        if (Number(refund.MaDonHang) !== Number(order.MaDonHang)) throw new Error('Yêu cầu hoàn tiền không khớp đơn hàng.');
        const [[payment]] = await connection.query(
            'SELECT * FROM ThanhToan WHERE MaThanhToan=? FOR UPDATE',
            [refund.MaThanhToan],
        );
        if (!order || !payment) throw new Error('Không tìm thấy đơn hàng hoặc giao dịch thanh toán.');

        const isUnshipped = cancellableStatuses.includes(order.TrangThaiDonHang);
        const isAlreadyCancelled = order.TrangThaiDonHang === 'DA_HUY';
        if (isUnshipped && !isAlreadyCancelled) {
            await releaseReservedStock(connection, order.MaDonHang, refund.MaNguoiXuLy, 'Giải phóng tồn giữ sau khi hoàn tiền và hủy đơn.');
        } else if (order.TrangThaiDonHang === 'DA_GIAO') {
            const [[returnRequest]] = await connection.query(
                "SELECT MaYeuCauTraHang FROM YeuCauTraHang WHERE MaDonHang=? AND TrangThai='DA_NHAN_HANG' FOR UPDATE",
                [order.MaDonHang],
            );
            if (!returnRequest) throw new Error('Cần duyệt yêu cầu và xác nhận đã nhận hàng trả trước khi hoàn tiền.');
            await restockReturnedItems(connection, order.MaDonHang, refund.MaNguoiXuLy, 'Đã nhận hàng hoàn và hoàn tiền.');
            await connection.query(
                "UPDATE YeuCauTraHang SET TrangThai='DA_HOAN_TIEN',NgayHoanTien=NOW(),MaNguoiXuLy=? WHERE MaYeuCauTraHang=?",
                [refund.MaNguoiXuLy || null, returnRequest.MaYeuCauTraHang],
            );
        }
        await restoreVoucherUsage(connection, order);

        const nextOrderStatus = order.TrangThaiDonHang === 'DA_GIAO' ? 'DA_HOAN_TIEN' : 'DA_HUY';
        await connection.query(
            `UPDATE YeuCauHoanTien SET TrangThai='THANH_CONG',MaGiaoDich=? WHERE MaHoanTien=?`,
            [providerTransactionId || null, refundId],
        );
        await connection.query(
            "UPDATE ThanhToan SET TrangThai='HOAN_TIEN' WHERE MaThanhToan=?",
            [payment.MaThanhToan],
        );
        await connection.query(
            'UPDATE DonHang SET TrangThaiDonHang=?,TrangThaiThanhToan=\'HOAN_TIEN\' WHERE MaDonHang=?',
            [nextOrderStatus, order.MaDonHang],
        );
        if (order.TrangThaiDonHang !== nextOrderStatus) {
            await writeHistory(connection, order.MaDonHang, order.TrangThaiDonHang, nextOrderStatus, refund.MaNguoiXuLy, 'Hoàn tiền đã được xác nhận.');
        }
        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function failRefund(refundId) {
    await db.query(
        "UPDATE YeuCauHoanTien SET TrangThai='THAT_BAI' WHERE MaHoanTien=? AND TrangThai='CHO_XU_LY'",
        [refundId],
    );
}

async function requestRefund({ orderId, userId, reason, returnedItems = false, confirmManual = false }) {
    const connection = await db.getConnection();
    let refund;
    let payment;
    let order;
    try {
        await connection.beginTransaction();
        [[order]] = await connection.query('SELECT * FROM DonHang WHERE MaDonHang=? FOR UPDATE', [orderId]);
        if (!order) throw new Error('Không tìm thấy đơn hàng.');
        const [[latestPayment]] = await connection.query(
            'SELECT * FROM ThanhToan WHERE MaDonHang=? ORDER BY LanThu DESC LIMIT 1 FOR UPDATE',
            [orderId],
        );
        payment = latestPayment;
        if (!payment || payment.TrangThai !== 'THANH_CONG') throw new Error('Chỉ hoàn được giao dịch đã thanh toán thành công.');
        if (order.TrangThaiThanhToan === 'HOAN_TIEN') throw new Error('Đơn hàng đã được hoàn tiền.');

        const isUnshipped = cancellableStatuses.includes(order.TrangThaiDonHang);
        const isAlreadyCancelled = order.TrangThaiDonHang === 'DA_HUY';
        const isReturned = order.TrangThaiDonHang === 'DA_GIAO' && returnedItems;
        if (!isUnshipped && !isAlreadyCancelled && !isReturned) {
            throw new Error('Chỉ hoàn đơn chưa giao, đơn đã hủy nhưng đã thanh toán, hoặc đơn đã giao và đã nhận hàng hoàn.');
        }
        if (order.TrangThaiDonHang === 'DA_GIAO' && !returnedItems) {
            throw new Error('Xác nhận đã nhận lại hàng trước khi hoàn tiền đơn đã giao.');
        }
        if (order.TrangThaiDonHang === 'DA_GIAO') {
            const [[returnRequest]] = await connection.query(
                "SELECT MaYeuCauTraHang FROM YeuCauTraHang WHERE MaDonHang=? AND TrangThai='DA_NHAN_HANG' FOR UPDATE",
                [order.MaDonHang],
            );
            if (!returnRequest) throw new Error('Cần duyệt yêu cầu trả hàng và xác nhận đã nhận hàng trước khi hoàn tiền.');
        }
        if (payment.PhuongThuc !== 'MOMO' && !confirmManual) {
            throw new Error('Cần xác nhận đã chuyển trả tiền thủ công trước khi hoàn tất.');
        }
        if (payment.PhuongThuc === 'MOMO' && !payment.MaGiaoDich) {
            throw new Error('Giao dịch MoMo chưa có mã giao dịch để yêu cầu hoàn tiền.');
        }
        const [[pendingRefund]] = await connection.query(
            "SELECT MaHoanTien FROM YeuCauHoanTien WHERE MaThanhToan=? AND TrangThai='CHO_XU_LY' LIMIT 1 FOR UPDATE",
            [payment.MaThanhToan],
        );
        if (pendingRefund) throw new Error('Đã có yêu cầu hoàn tiền đang xử lý.');

        const requestId = `REF-${crypto.randomUUID()}`;
        const [result] = await connection.query(
            `INSERT INTO YeuCauHoanTien(MaThanhToan,MaDonHang,MaYeuCau,PhuongThuc,SoTien,TrangThai,LyDo,MaNguoiXuLy)
             VALUES(?,?,?,?,?,'CHO_XU_LY',?,?)`,
            [payment.MaThanhToan, order.MaDonHang, requestId, payment.PhuongThuc === 'MOMO' ? 'MOMO' : 'THU_TAY', payment.SoTien, reason || 'Hoàn toàn bộ đơn hàng.', userId || null],
        );
        refund = { id: result.insertId, requestId };
        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }

    if (payment.PhuongThuc === 'MOMO' && String(payment.MaGiaoDich || '').startsWith('MOCK-')) {
        await finalizeRefund(refund.id, `MOCK-REF-${refund.requestId}`);
    } else if (payment.PhuongThuc === 'MOMO') {
        let result;
        try {
            result = await momo.refundPayment({
                amount: payment.SoTien,
                orderId: refund.requestId,
                requestId: refund.requestId,
                transId: payment.MaGiaoDich,
                description: String(reason || `Hoàn tiền đơn ${order.MaDonHangCode}`).slice(0, 100),
            });
        } catch (error) {
            await failRefund(refund.id);
            throw error;
        }
        await finalizeRefund(refund.id, String(result.transId || result.orderId || refund.requestId));
    } else {
        await finalizeRefund(refund.id, refund.requestId);
    }

    return { MaHoanTien: refund.id, SoTien: Number(payment.SoTien), TrangThai: 'THANH_CONG' };
}

async function cancelOrder({ orderId, userId }) {
    const connection = await db.getConnection();
    let order;
    let payment;
    try {
        await connection.beginTransaction();
        [[order]] = await connection.query(
            'SELECT * FROM DonHang WHERE MaDonHang=? AND MaNguoiDung=? FOR UPDATE',
            [orderId, userId],
        );
        if (!order) throw new Error('Không tìm thấy đơn hàng.');
        if (!cancellableStatuses.includes(order.TrangThaiDonHang)) throw new Error('Đơn hàng không còn ở trạng thái có thể hủy.');
        const [[latestPayment]] = await connection.query(
            'SELECT * FROM ThanhToan WHERE MaDonHang=? ORDER BY LanThu DESC LIMIT 1 FOR UPDATE',
            [orderId],
        );
        payment = latestPayment;
        if (payment?.TrangThai === 'THANH_CONG') {
            await connection.rollback();
            if (payment.PhuongThuc !== 'MOMO') {
                throw new Error('Thanh toán đã thu. Vui lòng liên hệ nhân viên để xác nhận hoàn tiền thủ công.');
            }
            return requestRefund({ orderId, userId, reason: 'Khách hủy đơn đã thanh toán trước khi giao.' });
        }

        await releaseReservedStock(connection, order.MaDonHang, userId, 'Khách hủy đơn chưa giao - giải phóng tồn giữ.');
        await restoreVoucherUsage(connection, order);
        await connection.query("UPDATE DonHang SET TrangThaiDonHang='DA_HUY' WHERE MaDonHang=?", [order.MaDonHang]);
        await connection.query("UPDATE ThanhToan SET TrangThai='DA_HUY',UrlThanhToan=NULL WHERE MaDonHang=? AND TrangThai='CHO_XU_LY'", [order.MaDonHang]);
        await writeHistory(connection, order.MaDonHang, order.TrangThaiDonHang, 'DA_HUY', userId, 'Khách hủy đơn chưa thanh toán và chưa giao.');
        await connection.commit();
        return { message: 'Đã hủy đơn hàng và giải phóng tồn kho.' };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function cancelAdminOrder({ orderId, userId }) {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [[order]] = await connection.query(
            'SELECT * FROM DonHang WHERE MaDonHang=? FOR UPDATE',
            [orderId],
        );
        if (!order) throw new Error('Không tìm thấy đơn hàng.');
        if (!cancellableStatuses.includes(order.TrangThaiDonHang)) {
            throw new Error('Đơn hàng không còn ở trạng thái có thể hủy.');
        }
        if (order.TrangThaiThanhToan === 'DA_THANH_TOAN') {
            throw new Error('Đơn đã thu tiền. Hãy xử lý hoàn tiền trước khi hủy.');
        }

        await releaseReservedStock(connection, order.MaDonHang, userId, 'Admin hủy đơn chưa giao - giải phóng tồn giữ.');
        await restoreVoucherUsage(connection, order);
        await connection.query("UPDATE DonHang SET TrangThaiDonHang='DA_HUY' WHERE MaDonHang=?", [order.MaDonHang]);
        await connection.query(
            "UPDATE ThanhToan SET TrangThai='DA_HUY',UrlThanhToan=NULL WHERE MaDonHang=? AND TrangThai='CHO_XU_LY'",
            [order.MaDonHang],
        );
        await writeHistory(connection, order.MaDonHang, order.TrangThaiDonHang, 'DA_HUY', userId, 'Admin hủy đơn chưa thanh toán và chưa giao.');
        await connection.commit();
        return { message: 'Đã hủy đơn hàng, giải phóng tồn kho và hoàn lại lượt voucher.' };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

module.exports = { cancelAdminOrder, cancelOrder, finalizeRefund, requestRefund };
