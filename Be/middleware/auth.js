const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const header = req.headers.authorization || '';
        if (!header.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập.' });
        }
        req.user = jwt.verify(header.substring(7), process.env.JWT_SECRET);
        next();
    } catch (e) {
        return res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn.' });
    }
};
