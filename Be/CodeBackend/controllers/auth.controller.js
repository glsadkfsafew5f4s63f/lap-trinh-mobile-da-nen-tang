const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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
        role: row.TenVaiTro,
        address: ''
    };
}

function createToken(user) {
    return jwt.sign({
        id: user.id,
        roleId: user.roleId,
        role: user.role,
    }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
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
            'SELECT MaNguoiDung, HoTen, Email, SoDienThoai FROM NguoiDung WHERE MaNguoiDung = ?',
            [result.insertId]
        );
        const user = toUser(rows[0]);
        res.status(201).json({ success: true, data: user, token: createToken(user) });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

async function authenticate(req, res, adminOnly = false) {
    const identifier = String(req.body.identifier || req.body.phone || '').trim();
    const password = String(req.body.password || '');
    const [rows] = await db.query(
        `SELECT nguoidung.*, vaitro.TenVaiTro
         FROM NguoiDung nguoidung
         INNER JOIN VaiTro vaitro ON vaitro.MaVaiTro = nguoidung.MaVaiTro
         WHERE (nguoidung.Email = ? OR nguoidung.SoDienThoai = ? OR nguoidung.HoTen = ?)
           AND nguoidung.TrangThai = 1
         LIMIT 1`,
        [identifier, normalizePhone(identifier), identifier]
    );
    const account = rows[0];

    if (!account || adminOnly && Number(account.MaVaiTro) !== 1 && account.TenVaiTro !== 'Admin') {
        return res.status(401).json({ success: false, message: 'Thông tin đăng nhập hoặc quyền truy cập không đúng.' });
    }

    const validPassword = await bcrypt.compare(password, account.MatKhau);
    if (!validPassword) {
        return res.status(401).json({ success: false, message: 'Thông tin đăng nhập hoặc quyền truy cập không đúng.' });
    }

    const user = toUser(account);
    return res.json({ success: true, data: user, token: createToken(user) });
}

exports.login = async (req, res) => {
    try {
        await authenticate(req, res);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.adminLogin = async (req, res) => {
    try {
        await authenticate(req, res, true);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};