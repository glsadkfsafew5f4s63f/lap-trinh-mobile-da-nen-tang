const Lienhe = require('../models/lienhe.model');
const db = require('../common/db');

exports.getAll = async (req, res) => {
    try {
        const data = await Lienhe.getAll();
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const data = await Lienhe.getById(req.params.id);
        if (!data) return res.status(404).json({ success: false, message: 'Không tìm thấy dữ liệu' });
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const result = await Lienhe.create(req.body);
        res.status(201).json({ success: true, message: 'Thêm thành công', data: result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.createFromCustomer = async (req, res) => {
    const invalid = (message) => Object.assign(new Error(message), { statusCode: 400 });
    try {
        const fullName = String(req.body.HoTen || '').trim();
        const email = String(req.body.Email || '').trim() || null;
        const phone = String(req.body.SoDienThoai || '').trim() || null;
        const subject = String(req.body.ChuDe || '').trim() || null;
        const message = String(req.body.NoiDung || '').trim();

        if (!fullName || fullName.length > 100) throw invalid('Họ tên là bắt buộc và tối đa 100 ký tự.');
        if (!email && !phone) throw invalid('Cần cung cấp email hoặc số điện thoại để cửa hàng phản hồi.');
        if (email && (email.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) throw invalid('Email không hợp lệ.');
        if (phone && phone.length > 20) throw invalid('Số điện thoại tối đa 20 ký tự.');
        if (subject && subject.length > 255) throw invalid('Chủ đề tối đa 255 ký tự.');
        if (!message || message.length > 5000) throw invalid('Nội dung là bắt buộc và tối đa 5000 ký tự.');

        const [result] = await db.query(
            `INSERT INTO LienHe(MaNguoiDung,HoTen,Email,SoDienThoai,ChuDe,NoiDung)
             VALUES(?,?,?,?,?,?)`,
            [req.user?.id || null, fullName, email, phone, subject, message],
        );
        res.status(201).json({
            success: true,
            data: { MaLienHe: result.insertId, TrangThai: 'CHUA_XU_LY' },
            message: 'Đã gửi yêu cầu liên hệ. Cửa hàng sẽ phản hồi qua thông tin bạn cung cấp.',
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : 'Không thể gửi yêu cầu liên hệ lúc này.',
        });
    }
};

exports.update = async (req, res) => {
    try {
        const result = await Lienhe.update(req.params.id, req.body);
        if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Không tìm thấy dữ liệu' });
        res.json({ success: true, message: 'Cập nhật thành công', data: result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.remove = async (req, res) => {
    try {
        const result = await Lienhe.delete(req.params.id);
        if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Không tìm thấy dữ liệu' });
        res.json({ success: true, message: 'Xóa thành công' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.search = async (req, res) => {
    try {
        const keyword = `%${req.query.keyword || ''}%`;
        const data = await Lienhe.search(keyword);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
