const Donhang = require('../models/donhang.model');
const realtime = require('../common/realtime');

exports.getAll = async (req, res) => {
    try {
        const data = await Donhang.getAll();
        const withItems = await Promise.all(data.map(async (order) => ({
            ...order,
            items: await Donhang.getItemsByOrderId(order.MaDonHang),
        })));
        res.json({ success: true, data: withItems });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const data = await Donhang.getById(req.params.id);
        if (!data) return res.status(404).json({ success: false, message: 'Không tìm thấy dữ liệu' });
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const result = await Donhang.create(req.body);
        res.status(201).json({ success: true, message: 'Thêm thành công', data: result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.checkout = async (req, res) => {
    try {
        if (!req.body.MaNguoiDung || !Array.isArray(req.body.items) || req.body.items.length === 0) {
            return res.status(400).json({ success: false, message: 'Đơn hàng phải có người dùng và sản phẩm' });
        }
        const result = await Donhang.createCheckout(req.body);
        res.status(201).json({ success: true, message: 'Đặt hàng thành công', data: result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const current = await Donhang.getById(req.params.id);
        if (!current) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        if (current.TrangThai === 'DaGiao') {
            return res.status(409).json({ success: false, message: 'Đơn hàng đã giao thành công và không thể chỉnh sửa.' });
        }
        if (['DangGiao', 'DaGiao'].includes(req.body.TrangThai)
            && !['DaCoc', 'DaThanhToan'].includes(current.TrangThaiThanhToan)) {
            return res.status(409).json({ success: false, message: 'Chưa thể giao hàng khi chưa xác nhận tiền cọc.' });
        }
        const result = await Donhang.update(req.params.id, req.body);
        if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Không tìm thấy dữ liệu' });
        const updatedOrder = await Donhang.getById(req.params.id);
        if (updatedOrder?.TrangThai === 'DaGiao') {
            realtime.broadcast({ type: 'order.delivered', order: updatedOrder });
        }
        res.json({ success: true, message: 'Cập nhật thành công', data: result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.remove = async (req, res) => {
    try {
        const current = await Donhang.getById(req.params.id);
        if (!current) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        if (current.TrangThai === 'DaGiao') {
            return res.status(409).json({ success: false, message: 'Đơn hàng đã giao thành công và không thể xóa.' });
        }
        const result = await Donhang.delete(req.params.id);
        if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Không tìm thấy dữ liệu' });
        res.json({ success: true, message: 'Xóa thành công' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.search = async (req, res) => {
    try {
        const keyword = `%${req.query.keyword || ''}%`;
        const data = await Donhang.search(keyword);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
