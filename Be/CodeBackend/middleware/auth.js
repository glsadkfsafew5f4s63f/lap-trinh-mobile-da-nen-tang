const jwt = require('jsonwebtoken');

function getToken(req) {
    const header = req.headers.authorization || '';
    return header.startsWith('Bearer ') ? header.slice(7) : null;
}

function verifyToken(req, res, next) {
    const token = getToken(req);
    if (!token) {
        return res.status(401).json({ success: false, message: 'Yêu cầu đăng nhập.' });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        return next();
    } catch {
        return res.status(401).json({ success: false, message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' });
    }
}

function requireAdmin(req, res, next) {
    return verifyToken(req, res, () => {
        if (Number(req.user.roleId) !== 1 && req.user.role !== 'Admin') {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền quản trị.' });
        }
        return next();
    });
}

module.exports = { verifyToken, requireAdmin };
