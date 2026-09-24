const db = require('../common/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function tokenFor(user, roles) {
    return jwt.sign({ id: user.MaNguoiDung, username: user.TenDangNhap, roles }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}

async function getRoles(userId) {
    const [rows] = await db.query(`
        SELECT vt.MaVaiTro, vt.TenVaiTro
        FROM NguoiDungVaiTro ndvt
        JOIN VaiTro vt ON vt.MaVaiTro = ndvt.MaVaiTro
        WHERE ndvt.MaNguoiDung = ? AND vt.TrangThai = 1
        ORDER BY vt.MaVaiTro`, [userId]);
    return rows;
}

exports.register = async (req, res) => {
    const conn = await db.getConnection();
    try {
        const { username, password, fullName, email, phone } = req.body;
        if (!username || !password || !fullName) return res.status(400).json({ success:false, message:'username, password, fullName là bắt buộc.' });
        if (password.length < 6) return res.status(400).json({ success:false, message:'Mật khẩu phải có ít nhất 6 ký tự.' });

        await conn.beginTransaction();
        const [exists] = await conn.query(`SELECT MaNguoiDung FROM NguoiDung WHERE TenDangNhap=? OR (? IS NOT NULL AND Email=?) OR (? IS NOT NULL AND DienThoai=?) LIMIT 1`, [username, email || null, email || null, phone || null, phone || null]);
        if (exists.length) { await conn.rollback(); return res.status(409).json({ success:false, message:'Tên đăng nhập, email hoặc số điện thoại đã tồn tại.' }); }

        const hash = await bcrypt.hash(password, 12);
        const [r] = await conn.query(`INSERT INTO NguoiDung (TenDangNhap,MatKhau,HoTen,Email,DienThoai) VALUES (?,?,?,?,?)`, [username,hash,fullName,email||null,phone||null]);
        const [[role]] = await conn.query(`SELECT MaVaiTro FROM VaiTro WHERE TenVaiTro='KHACH_HANG' AND TrangThai=1 LIMIT 1`);
        if (!role) throw new Error('Chưa có vai trò KHACH_HANG trong database.');
        await conn.query(`INSERT INTO NguoiDungVaiTro (MaNguoiDung,MaVaiTro) VALUES (?,?)`, [r.insertId,role.MaVaiTro]);
        await conn.query(`INSERT INTO GioHang (MaNguoiDung) VALUES (?)`, [r.insertId]);
        await conn.commit();
        res.status(201).json({ success:true, message:'Đăng ký thành công.', data:{ MaNguoiDung:r.insertId, TenDangNhap:username, HoTen:fullName, Email:email||null } });
    } catch (e) { try { await conn.rollback(); } catch (_) {} res.status(400).json({ success:false, message:e.message }); }
    finally { conn.release(); }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ success:false, message:'Vui lòng nhập tài khoản và mật khẩu.' });
        const [rows] = await db.query(`SELECT * FROM NguoiDung WHERE TenDangNhap=? LIMIT 1`, [username]);
        if (!rows.length) return res.status(401).json({ success:false, message:'Tài khoản hoặc mật khẩu không đúng.' });
        const user = rows[0];
        if (user.TrangThai !== 'HOAT_DONG') return res.status(403).json({ success:false, message:'Tài khoản đang bị khóa.' });
        if (!(await bcrypt.compare(password,user.MatKhau))) return res.status(401).json({ success:false, message:'Tài khoản hoặc mật khẩu không đúng.' });
        const roleRows = await getRoles(user.MaNguoiDung);
        const roles = roleRows.map(x => x.TenVaiTro);
        const token = tokenFor(user, roles);
        delete user.MatKhau;
        res.json({ success:true, message:'Đăng nhập thành công.', token, data:{...user, roles, roleDetails:roleRows} });
    } catch (e) { res.status(500).json({ success:false, message:e.message }); }
};

exports.me = async (req,res) => {
    try {
        const [rows] = await db.query(`SELECT MaNguoiDung,TenDangNhap,HoTen,Email,DienThoai,DiaChi,AnhDaiDien,TrangThai,NgayTao FROM NguoiDung WHERE MaNguoiDung=?`, [req.user.id]);
        if (!rows.length) return res.status(404).json({success:false,message:'Không tìm thấy tài khoản.'});
        const roleRows = await getRoles(req.user.id);
        res.json({success:true,data:{...rows[0],roles:roleRows.map(x=>x.TenVaiTro),roleDetails:roleRows}});
    } catch(e) { res.status(500).json({success:false,message:e.message}); }
};
