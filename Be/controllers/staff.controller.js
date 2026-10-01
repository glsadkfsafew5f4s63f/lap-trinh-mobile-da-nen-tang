const db = require('../common/db');
const bcrypt = require('bcryptjs');
const permissions = require('../config/permissions');

const operationalRoles = [...new Set(Object.values(permissions).flat())];
const accountRoles = ['ADMIN', ...operationalRoles];
const managedRoles = ['ADMIN', 'NHAN_VIEN', ...operationalRoles];

exports.create = async (req, res) => {
    const { TenDangNhap, MatKhau, HoTen, Email, DienThoai } = req.body;
    const roleIds = Array.isArray(req.body.MaVaiTro)
        ? [...new Set(req.body.MaVaiTro.map(Number).filter(Number.isInteger))]
        : [];
    if (!TenDangNhap || !MatKhau || !HoTen || !roleIds.length) {
        return res.status(400).json({ success: false, message: 'Tên đăng nhập, mật khẩu, họ tên và vai trò là bắt buộc.' });
    }
    if (String(MatKhau).length < 8) {
        return res.status(400).json({ success: false, message: 'Mật khẩu nhân viên phải có ít nhất 8 ký tự.' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [roles] = await connection.query(
            'SELECT MaVaiTro,TenVaiTro FROM VaiTro WHERE MaVaiTro IN (?) AND TrangThai=1 FOR UPDATE',
            [roleIds],
        );
        if (roles.length !== roleIds.length || roles.some((item) => !accountRoles.includes(item.TenVaiTro))) {
            throw Object.assign(new Error('Có vai trò không hợp lệ hoặc đã bị tắt.'), { status: 400 });
        }

        const passwordHash = await bcrypt.hash(String(MatKhau), 12);
        const [userResult] = await connection.query(
            'INSERT INTO NguoiDung(TenDangNhap,MatKhau,HoTen,Email,DienThoai) VALUES(?,?,?,?,?)',
            [String(TenDangNhap).trim(), passwordHash, String(HoTen).trim(), Email || null, DienThoai || null],
        );
        for (const roleId of roleIds) {
            await connection.query('INSERT INTO NguoiDungVaiTro(MaNguoiDung,MaVaiTro) VALUES(?,?)', [userResult.insertId, roleId]);
        }
        await connection.commit();
        res.status(201).json({
            success: true,
            data: {
                MaNguoiDung: userResult.insertId,
                TenDangNhap: String(TenDangNhap).trim(),
                HoTen: String(HoTen).trim(),
                Email: Email || null,
                DienThoai: DienThoai || null,
                TrangThai: 'HOAT_DONG',
                NgayTao: new Date().toISOString(),
                roles: roles.map((item) => item.TenVaiTro),
                roleIds: roleIds.join(','),
            },
        });
    } catch (error) {
        try { await connection.rollback(); } catch (_) {}
        res.status(error.status || 400).json({ success: false, message: error.code === 'ER_DUP_ENTRY' ? 'Tên đăng nhập, email hoặc số điện thoại đã tồn tại.' : error.message });
    } finally {
        connection.release();
    }
};

exports.list = async (_req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT nd.MaNguoiDung,nd.TenDangNhap,nd.HoTen,nd.Email,nd.DienThoai,nd.TrangThai,nd.NgayTao,
                    GROUP_CONCAT(DISTINCT vt.TenVaiTro ORDER BY vt.TenVaiTro SEPARATOR ', ') roles,
                    GROUP_CONCAT(DISTINCT vt.MaVaiTro ORDER BY vt.MaVaiTro SEPARATOR ',') roleIds
             FROM NguoiDung nd
             LEFT JOIN NguoiDungVaiTro ndvt ON ndvt.MaNguoiDung=nd.MaNguoiDung
             LEFT JOIN VaiTro vt ON vt.MaVaiTro=ndvt.MaVaiTro
             WHERE EXISTS (
                 SELECT 1 FROM NguoiDungVaiTro staffAssignment
                 JOIN VaiTro staffRole ON staffRole.MaVaiTro=staffAssignment.MaVaiTro
                 WHERE staffAssignment.MaNguoiDung=nd.MaNguoiDung AND staffRole.TenVaiTro IN (?)
             )
             GROUP BY nd.MaNguoiDung ORDER BY nd.MaNguoiDung DESC`,
            [managedRoles],
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateRoles = async (req, res) => {
    const roleIds = Array.isArray(req.body.MaVaiTro)
        ? [...new Set(req.body.MaVaiTro.map(Number).filter(Number.isInteger))]
        : [];
    if (!roleIds.length) return res.status(400).json({ success: false, message: 'Phải chọn ít nhất một vai trò.' });

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [[user]] = await connection.query(
            `SELECT nd.MaNguoiDung FROM NguoiDung nd
             WHERE nd.MaNguoiDung=? AND EXISTS (
                 SELECT 1 FROM NguoiDungVaiTro ndvt JOIN VaiTro vt ON vt.MaVaiTro=ndvt.MaVaiTro
                 WHERE ndvt.MaNguoiDung=nd.MaNguoiDung AND vt.TenVaiTro IN (?)
             ) FOR UPDATE`,
            [req.params.id, managedRoles],
        );
        if (!user) throw Object.assign(new Error('Không tìm thấy tài khoản nhân viên.'), { status: 404 });

        const [roles] = await connection.query(
            'SELECT MaVaiTro,TenVaiTro FROM VaiTro WHERE MaVaiTro IN (?) AND TrangThai=1 FOR UPDATE',
            [roleIds],
        );
        if (roles.length !== roleIds.length || roles.some((item) => !accountRoles.includes(item.TenVaiTro))) {
            throw Object.assign(new Error('Có vai trò không hợp lệ hoặc đã bị tắt.'), { status: 400 });
        }

        const keepsAdmin = roles.some((item) => item.TenVaiTro === 'ADMIN');
        const [[currentAdmin]] = await connection.query(
            `SELECT COUNT(DISTINCT nd.MaNguoiDung) total FROM NguoiDung nd
             JOIN NguoiDungVaiTro ndvt ON ndvt.MaNguoiDung=nd.MaNguoiDung
             JOIN VaiTro vt ON vt.MaVaiTro=ndvt.MaVaiTro
             WHERE nd.TrangThai='HOAT_DONG' AND vt.TenVaiTro='ADMIN'`,
        );
        const [[targetAdmin]] = await connection.query(
            `SELECT COUNT(*) total FROM NguoiDungVaiTro ndvt
             JOIN VaiTro vt ON vt.MaVaiTro=ndvt.MaVaiTro
             WHERE ndvt.MaNguoiDung=? AND vt.TenVaiTro='ADMIN'`,
            [req.params.id],
        );
        if (Number(targetAdmin.total) && !keepsAdmin && Number(currentAdmin.total) <= 1) {
            throw Object.assign(new Error('Không thể gỡ vai trò ADMIN cuối cùng đang hoạt động.'), { status: 400 });
        }

        await connection.query('DELETE FROM NguoiDungVaiTro WHERE MaNguoiDung=?', [req.params.id]);
        for (const roleId of roleIds) {
            await connection.query('INSERT INTO NguoiDungVaiTro(MaNguoiDung,MaVaiTro) VALUES(?,?)', [req.params.id, roleId]);
        }
        await connection.commit();
        res.json({ success: true, roles: roles.map((item) => item.TenVaiTro) });
    } catch (error) {
        try { await connection.rollback(); } catch (_) {}
        res.status(error.status || 400).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
};

exports.updateStatus = async (req, res) => {
    const status = req.body.TrangThai;
    if (!['HOAT_DONG', 'KHOA'].includes(status)) {
        return res.status(400).json({ success: false, message: 'TrangThai không hợp lệ.' });
    }
    if (Number(req.params.id) === Number(req.user.id) && status === 'KHOA') {
        return res.status(400).json({ success: false, message: 'Không thể tự khóa tài khoản đang đăng nhập.' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [[user]] = await connection.query(
            `SELECT nd.MaNguoiDung,nd.TrangThai,
                    EXISTS(SELECT 1 FROM NguoiDungVaiTro ndvt JOIN VaiTro vt ON vt.MaVaiTro=ndvt.MaVaiTro
                           WHERE ndvt.MaNguoiDung=nd.MaNguoiDung AND vt.TenVaiTro='ADMIN') isAdmin
             FROM NguoiDung nd
             WHERE nd.MaNguoiDung=? AND EXISTS (
                 SELECT 1 FROM NguoiDungVaiTro staffAssignment
                 JOIN VaiTro staffRole ON staffRole.MaVaiTro=staffAssignment.MaVaiTro
                 WHERE staffAssignment.MaNguoiDung=nd.MaNguoiDung AND staffRole.TenVaiTro IN (?)
             ) FOR UPDATE`,
            [req.params.id, managedRoles],
        );
        if (!user) throw Object.assign(new Error('Không tìm thấy tài khoản nhân viên.'), { status: 404 });
        if (user.TrangThai === status) {
            await connection.commit();
            return res.json({ success: true, affectedRows: 0 });
        }

        if (status === 'KHOA' && Number(user.isAdmin)) {
            const [activeAdmins] = await connection.query(
                `SELECT nd.MaNguoiDung FROM NguoiDung nd
                 JOIN NguoiDungVaiTro ndvt ON ndvt.MaNguoiDung=nd.MaNguoiDung
                 JOIN VaiTro vt ON vt.MaVaiTro=ndvt.MaVaiTro
                 WHERE nd.TrangThai='HOAT_DONG' AND vt.TenVaiTro='ADMIN' FOR UPDATE`,
            );
            if (activeAdmins.length <= 1) {
                throw Object.assign(new Error('Không thể khóa ADMIN cuối cùng đang hoạt động.'), { status: 400 });
            }
        }

        await connection.query('UPDATE NguoiDung SET TrangThai=? WHERE MaNguoiDung=?', [status, req.params.id]);
        await connection.commit();
        res.json({ success: true, affectedRows: 1 });
    } catch (error) {
        try { await connection.rollback(); } catch (_) {}
        res.status(error.status || 400).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
};