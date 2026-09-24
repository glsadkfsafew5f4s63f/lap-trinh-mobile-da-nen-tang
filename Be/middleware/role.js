module.exports = (...allowedRoles) => (req, res, next) => {
    const roles = Array.isArray(req.user?.roles) ? req.user.roles : [];
    if (!allowedRoles.some(role => roles.includes(role))) {
        return res.status(403).json({ success: false, message: 'Bạn không có quyền thực hiện chức năng này.' });
    }
    next();
};
