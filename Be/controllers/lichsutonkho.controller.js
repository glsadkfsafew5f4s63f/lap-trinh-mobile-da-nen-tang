const Lichsutonkho = require('../models/lichsutonkho.model');

exports.getAll = async (req, res) => {
    try {
        const data = await Lichsutonkho.getAll();
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const data = await Lichsutonkho.getById(req.params.id);
        if (!data) return res.status(404).json({ success: false, message: 'Không tìm thấy dữ liệu' });
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const result = await Lichsutonkho.create(req.body);
        res.status(201).json({ success: true, message: 'Thêm thành công', data: result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const result = await Lichsutonkho.update(req.params.id, req.body);
        if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Không tìm thấy dữ liệu' });
        res.json({ success: true, message: 'Cập nhật thành công', data: result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.remove = async (req, res) => {
    try {
        const result = await Lichsutonkho.delete(req.params.id);
        if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Không tìm thấy dữ liệu' });
        res.json({ success: true, message: 'Xóa thành công' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.search = async (req, res) => {
    try {
        const keyword = `%${req.query.keyword || ''}%`;
        const data = await Lichsutonkho.search(keyword);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
