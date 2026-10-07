const jwt = require('jsonwebtoken');
const db = require('../common/db');

module.exports = async (req, res, next) => {
    const header = req.headers.authorization || '';
    if (!header) return next();
    if (!header.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Token không hợp lệ.' });
    }

    try {
        const tokenUser = jwt.verify(header.substring(7), process.env.JWT_SECRET);
        const [[user]] = await db.query(
            'SELECT MaNguoiDung,TrangThai FROM NguoiDung WHERE MaNguoiDung=?',
            [tokenUser.id],
        );
        if (!user || user.TrangThai !== 'HOAT_DONG') {
            return res.status(401).json({ success: false, message: 'Tài khoản không còn hoạt động.' });
        }
        req.user = { id: user.MaNguoiDung };
        next();
    } catch (_error) {
        res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn.' });
    }
};