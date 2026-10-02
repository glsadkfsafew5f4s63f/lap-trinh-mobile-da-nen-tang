const crypto = require('crypto');
const db = require('../common/db');
const momo = require('../utils/momo');
const orderPayments = require('../utils/orderPayments');

exports.createMomoPayment = async (req, res) => {
	const connection = await db.getConnection();
	let payment;
	let order;
	let providerOrderId;
	try {
		await connection.beginTransaction();
		[[order]] = await connection.query(
			'SELECT * FROM DonHang WHERE MaDonHang=? AND MaNguoiDung=? FOR UPDATE',
			[req.params.orderId, req.user.id],
		);
		if (!order) throw new Error('Không tìm thấy đơn hàng.');
		if (!['CHO_XAC_NHAN', 'DA_XAC_NHAN', 'DANG_CHUAN_BI'].includes(order.TrangThaiDonHang)) {
			throw new Error('Đơn hàng không còn ở trạng thái có thể thanh toán.');
		}
		if (order.TrangThaiThanhToan !== 'CHUA_THANH_TOAN') throw new Error('Đơn hàng không còn chờ thanh toán.');

		[[payment]] = await connection.query(
			'SELECT * FROM ThanhToan WHERE MaDonHang=? ORDER BY LanThu DESC LIMIT 1 FOR UPDATE',
			[order.MaDonHang],
		);
		if (!payment || payment.PhuongThuc !== 'MOMO') throw new Error('Đơn hàng này không sử dụng MoMo.');
		if (payment.TrangThai === 'THANH_CONG' || payment.TrangThai === 'HOAN_TIEN') {
			throw new Error('Đơn hàng đã được thanh toán.');
		}
		if (!momo.isMockPaymentEnabled() && payment.TrangThai === 'CHO_XU_LY' && payment.UrlThanhToan) {
			await connection.commit();
			return res.json({
				success: true,
				data: { payUrl: payment.UrlThanhToan, redirectUrl: process.env.MOMO_REDIRECT_URL || 'anhuyqa://payment-result' },
			});
		}
		if (payment.TrangThai !== 'CHO_XU_LY') {
			const [result] = await connection.query(
				`INSERT INTO ThanhToan(MaDonHang,PhuongThuc,LanThu,SoTien,TrangThai)
				 VALUES(?,?,?,?,'CHO_XU_LY')`,
				[order.MaDonHang, 'MOMO', Number(payment.LanThu) + 1, order.ThanhTien],
			);
			payment = { MaThanhToan: result.insertId, LanThu: Number(payment.LanThu) + 1, SoTien: order.ThanhTien };
		}
		if (momo.isMockPaymentEnabled()) {
			await connection.query(
				`UPDATE ThanhToan SET TrangThai='THANH_CONG',MaGiaoDich=?,ThoiGianThanhToan=NOW(),UrlThanhToan=NULL
				 WHERE MaThanhToan=? AND TrangThai='CHO_XU_LY'`,
				[`MOCK-${payment.MaThanhToan}`, payment.MaThanhToan],
			);
			await connection.query(
				"UPDATE DonHang SET TrangThaiThanhToan='DA_THANH_TOAN' WHERE MaDonHang=? AND TrangThaiThanhToan='CHUA_THANH_TOAN'",
				[order.MaDonHang],
			);
			await connection.commit();
			return res.status(201).json({
				success: true,
				data: { mock: true, message: 'Thanh toán giả lập thành công. Không thu tiền thật.' },
			});
		}
		providerOrderId = payment.MaYeuCauThanhToan || `SHOP-${payment.MaThanhToan}-${crypto.randomUUID().replace(/-/g, '')}`;
		await connection.query(
			'UPDATE ThanhToan SET MaYeuCauThanhToan=?,UrlThanhToan=NULL WHERE MaThanhToan=?',
			[providerOrderId, payment.MaThanhToan],
		);
		await connection.commit();
	} catch (error) {
		await connection.rollback();
		return res.status(400).json({ success: false, message: error.message });
	} finally {
		connection.release();
	}

	try {
		const result = await momo.createPayment({
			amount: payment.SoTien,
			orderId: providerOrderId,
			requestId: providerOrderId,
			orderInfo: `Thanh toan don hang ${order.MaDonHangCode}`,
		});
		await db.query('UPDATE ThanhToan SET UrlThanhToan=? WHERE MaThanhToan=? AND TrangThai=\'CHO_XU_LY\'', [result.payUrl, payment.MaThanhToan]);
		res.status(201).json({ success: true, data: result });
	} catch (error) {
		await db.query(
			"UPDATE ThanhToan SET TrangThai='THAT_BAI',UrlThanhToan=NULL WHERE MaThanhToan=? AND TrangThai='CHO_XU_LY'",
			[payment.MaThanhToan],
		);
		res.status(502).json({ success: false, message: error.message || 'Không thể khởi tạo thanh toán MoMo.' });
	}
};

exports.momoIpn = async (req, res) => {
	const data = req.body || {};
	if (!momo.verifyIpn(data)) return res.status(400).json({ resultCode: 1, message: 'Chữ ký MoMo không hợp lệ.' });
	const connection = await db.getConnection();
	let latePayment = false;
	let lateOrderId;
	try {
		await connection.beginTransaction();
		const [[paymentRef]] = await connection.query(
			'SELECT MaDonHang FROM ThanhToan WHERE MaYeuCauThanhToan=?',
			[data.orderId],
		);
		if (!paymentRef) throw new Error('Không tìm thấy giao dịch.');
		const [[order]] = await connection.query('SELECT * FROM DonHang WHERE MaDonHang=? FOR UPDATE', [paymentRef.MaDonHang]);
		if (!order) throw new Error('Không tìm thấy đơn hàng.');
		const [[payment]] = await connection.query(
			'SELECT * FROM ThanhToan WHERE MaYeuCauThanhToan=? FOR UPDATE',
			[data.orderId],
		);
		if (!payment || payment.PhuongThuc !== 'MOMO' || Number(payment.SoTien) !== Number(data.amount)) {
			throw new Error('Không tìm thấy giao dịch hoặc số tiền không khớp.');
		}
		if (payment.TrangThai === 'THANH_CONG') {
			await connection.rollback();
			return res.json({ resultCode: 0, message: 'Giao dịch đã được ghi nhận.' });
		}
		const paidAfterCancellation = payment.TrangThai === 'DA_HUY' && Number(data.resultCode) === 0;
		if (payment.TrangThai !== 'CHO_XU_LY' && !paidAfterCancellation) {
			await connection.rollback();
			return res.json({ resultCode: 0, message: 'Giao dịch đã đóng.' });
		}

		if (Number(data.resultCode) === 0) {
			await connection.query(
				`UPDATE ThanhToan SET TrangThai='THANH_CONG',MaGiaoDich=?,ThoiGianThanhToan=NOW(),UrlThanhToan=NULL
				 WHERE MaThanhToan=?`,
				[String(data.transId), payment.MaThanhToan],
			);
			if (order.TrangThaiDonHang === 'DA_HUY') {
				latePayment = true;
				lateOrderId = order.MaDonHang;
			} else {
				await connection.query(
					"UPDATE DonHang SET TrangThaiThanhToan='DA_THANH_TOAN' WHERE MaDonHang=?",
					[order.MaDonHang],
				);
			}
		} else {
			await connection.query(
				"UPDATE ThanhToan SET TrangThai='THAT_BAI',UrlThanhToan=NULL WHERE MaThanhToan=?",
				[payment.MaThanhToan],
			);
		}
		await connection.commit();
	} catch (error) {
		await connection.rollback();
		return res.status(400).json({ resultCode: 1, message: error.message });
	} finally {
		connection.release();
	}

	if (latePayment) {
		try {
			await orderPayments.requestRefund({
				orderId: lateOrderId,
				reason: 'Hoàn tự động do MoMo xác nhận giao dịch sau khi đơn đã bị hủy.',
			});
		} catch (error) {
			console.error('MoMo late-payment refund failed:', error.message);
		}
	}
	res.json({ resultCode: 0, message: 'Đã nhận kết quả thanh toán.' });
};

exports.retry = async (req, res) => {
	if (req.body.PhuongThuc && req.body.PhuongThuc !== 'MOMO') {
		return res.status(400).json({ success: false, message: 'Hiện chỉ hỗ trợ thanh toán lại qua MoMo.' });
	}
	return exports.createMomoPayment(req, res);
};

exports.collectCod = async (req, res) => {
	const connection = await db.getConnection();
	try {
		await connection.beginTransaction();
		const [[order]] = await connection.query('SELECT * FROM DonHang WHERE MaDonHang=? FOR UPDATE', [req.params.id]);
		if (!order) throw new Error('Không tìm thấy đơn hàng.');
		if (order.TrangThaiDonHang !== 'DA_GIAO') throw new Error('Chỉ xác nhận thu COD sau khi giao hàng thành công.');
		if (order.TrangThaiThanhToan !== 'CHUA_THANH_TOAN') throw new Error('Đơn hàng không còn chờ thu tiền.');
		const [[payment]] = await connection.query(
			'SELECT * FROM ThanhToan WHERE MaDonHang=? ORDER BY LanThu DESC LIMIT 1 FOR UPDATE',
			[order.MaDonHang],
		);
		if (!payment || payment.PhuongThuc !== 'COD' || payment.TrangThai !== 'CHO_XU_LY') {
			throw new Error('Không tìm thấy khoản COD đang chờ xác nhận.');
		}
		await connection.query(
			"UPDATE ThanhToan SET TrangThai='THANH_CONG',MaGiaoDich=?,ThoiGianThanhToan=NOW() WHERE MaThanhToan=?",
			[`COD-${order.MaDonHangCode}`, payment.MaThanhToan],
		);
		await connection.query(
			"UPDATE DonHang SET TrangThaiThanhToan='DA_THANH_TOAN' WHERE MaDonHang=?",
			[order.MaDonHang],
		);
		await connection.query(
			`INSERT INTO LichSuDonHang(MaDonHang,TrangThaiCu,TrangThaiMoi,MaNguoiThayDoi,GhiChu)
			 VALUES(?,?,?,?,?)`,
			[order.MaDonHang, order.TrangThaiDonHang, order.TrangThaiDonHang, req.user.id, 'Nhân viên xác nhận đã thu tiền COD.'],
		);
		await connection.commit();
		res.json({ success: true, message: 'Đã xác nhận thu tiền COD.' });
	} catch (error) {
		await connection.rollback();
		res.status(400).json({ success: false, message: error.message });
	} finally {
		connection.release();
	}
};

exports.refund = async (req, res) => {
	try {
		const result = await orderPayments.requestRefund({
			orderId: Number(req.params.id),
			userId: req.user.id,
			reason: req.body.LyDo,
			returnedItems: req.body.DaNhanHangHoan === true,
			confirmManual: req.body.XacNhanDaChuyenTien === true,
		});
		res.json({ success: true, data: result, message: 'Đã hoàn tiền và cập nhật trạng thái đơn hàng.' });
	} catch (error) {
		res.status(400).json({ success: false, message: error.message });
	}
};
