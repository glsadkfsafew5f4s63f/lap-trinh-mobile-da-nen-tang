const bcrypt = require('bcryptjs');
const db = require('../common/db');

function normalizePhone(phone) {
    return String(phone || '').replace(/[\s()-]/g, '').trim();
}

function toUser(row) {
    return {
        id: row.MaNguoiDung,
        name: row.HoTen,
        phone: row.SoDienThoai,
        email: row.Email,
        roleId: row.MaVaiTro,
        role: row.TenVaiTro || (Number(row.MaVaiTro) === 1 ? 'Admin' : 'KhachHang'),
        address: ''
    };
}

exports.register = async (req, res) => {
    try {
        const name = String(req.body.name || '').trim();
        const phone = normalizePhone(req.body.phone);
        const password = String(req.body.password || '');

        if (!name || !phone || !password) {
            return res.status(400).json({ success: false, message: 'Nhập đầy đủ họ tên, số điện thoại và mật khẩu.' });
        }
        if (!/^((\+84)|0)\d{9,10}$/.test(phone)) {
            return res.status(400).json({ success: false, message: 'Số điện thoại không hợp lệ.' });
        }

        const [existing] = await db.query(
            'SELECT MaNguoiDung FROM NguoiDung WHERE SoDienThoai = ? LIMIT 1',
            [phone]
        );
        if (existing.length > 0) {
            return res.status(409).json({ success: false, message: 'Số điện thoại này đã được đăng ký.' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const email = `${phone}@anhuyqa.local`;
        const [result] = await db.query(
            `INSERT INTO NguoiDung (MaVaiTro, HoTen, Email, SoDienThoai, MatKhau, TrangThai)
             VALUES (?, ?, ?, ?, ?, 1)`,
            [2, name, email, phone, passwordHash]
        );

        const [rows] = await db.query(
            `SELECT nd.MaNguoiDung, nd.MaVaiTro, nd.HoTen, nd.Email, nd.SoDienThoai, vt.TenVaiTro
             FROM NguoiDung nd LEFT JOIN VaiTro vt ON vt.MaVaiTro = nd.MaVaiTro
             WHERE nd.MaNguoiDung = ?`,
            [result.insertId]
        );
        res.status(201).json({ success: true, data: toUser(rows[0]) });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const identifier = String(req.body.identifier || req.body.email || req.body.phone || '').trim();
        const phone = normalizePhone(identifier);
        const password = String(req.body.password || '');
        const [rows] = await db.query(
            `SELECT nd.*, vt.TenVaiTro
             FROM NguoiDung nd LEFT JOIN VaiTro vt ON vt.MaVaiTro = nd.MaVaiTro
             WHERE (nd.SoDienThoai = ? OR nd.Email = ?) AND nd.TrangThai = 1 LIMIT 1`,
            [phone, identifier]
        );
        const account = rows[0];

        if (!account) {
            return res.status(401).json({ success: false, message: 'Số điện thoại hoặc mật khẩu không đúng.' });
        }
        const validPassword = await bcrypt.compare(password, account.MatKhau)
            || account.MatKhau === password;
        if (!validPassword) {
            return res.status(401).json({ success: false, message: 'Số điện thoại hoặc mật khẩu không đúng.' });
        }

        res.json({ success: true, data: toUser(account) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};