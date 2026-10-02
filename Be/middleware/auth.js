const jwt = require('jsonwebtoken');
const db = require('../common/db');

module.exports = async (req, res, next) => {
    let tokenUser;
    try {
        const header = req.headers.authorization || '';
        if (!header.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập.' });
        }
        tokenUser = jwt.verify(header.substring(7), process.env.JWT_SECRET);
    } catch {
        return res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn.' });
    }

    try {
        const [[user]] = await db.query(
            `SELECT nd.MaNguoiDung,nd.TenDangNhap,nd.TrangThai,
                    GROUP_CONCAT(DISTINCT vt.TenVaiTro) roles
             FROM NguoiDung nd
             LEFT JOIN NguoiDungVaiTro ndvt ON ndvt.MaNguoiDung=nd.MaNguoiDung
             LEFT JOIN VaiTro vt ON vt.MaVaiTro=ndvt.MaVaiTro AND vt.TrangThai=1
             WHERE nd.MaNguoiDung=?
             GROUP BY nd.MaNguoiDung`,
            [tokenUser.id],
        );
        if (!user || user.TrangThai !== 'HOAT_DONG') {
            return res.status(401).json({ success: false, message: 'Tài khoản không còn hoạt động. Vui lòng đăng nhập lại.' });
        }
        req.user = {
            ...tokenUser,
            id: user.MaNguoiDung,
            username: user.TenDangNhap,
            roles: user.roles ? user.roles.split(',') : [],
        };
        next();
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'Không thể xác thực tài khoản.' });
    }
};
