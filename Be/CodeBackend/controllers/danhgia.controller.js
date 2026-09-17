const Danhgia = require('../models/danhgia.model');

exports.getAll = async (req, res) => {
    try {
        const data = await Danhgia.getAll();
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getByProductId = async (req, res) => {
    try {
        const data = await Danhgia.getByProductId(req.params.productId);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const data = await Danhgia.getById(req.params.id);
        if (!data) return res.status(404).json({ success: false, message: 'Không tìm thấy dữ liệu' });
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const result = await Danhgia.create(req.body);
        res.status(201).json({ success: true, message: 'Thêm thành công', data: result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.createVerified = async (req, res) => {
    try {
        const { MaNguoiDung, MaSanPham, MaDonHang, SoSao, NoiDung } = req.body;
        if (!MaNguoiDung || !MaSanPham || !MaDonHang || !SoSao || Number(SoSao) < 1 || Number(SoSao) > 5) {
            return res.status(400).json({ success: false, message: 'Dữ liệu đánh giá không hợp lệ' });
        }
        const result = await Danhgia.createVerified({
            MaNguoiDung: Number(MaNguoiDung),
            MaSanPham: Number(MaSanPham),
            MaDonHang: Number(MaDonHang),
            SoSao: Number(SoSao),
            NoiDung: String(NoiDung || '').trim(),
        });
        res.status(201).json({ success: true, message: 'Đánh giá thành công', data: result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const result = await Danhgia.update(req.params.id, req.body);
        if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Không tìm thấy dữ liệu' });
        res.json({ success: true, message: 'Cập nhật thành công', data: result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.remove = async (req, res) => {
    try {
        const result = await Danhgia.delete(req.params.id);
        if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Không tìm thấy dữ liệu' });
        res.json({ success: true, message: 'Xóa thành công' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.search = async (req, res) => {
    try {
        const keyword = `%${req.query.keyword || ''}%`;
        const data = await Danhgia.search(keyword);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
