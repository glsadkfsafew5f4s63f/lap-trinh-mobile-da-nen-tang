const TinNhan = require('../models/tinnhan.model');
const realtime = require('../common/realtime');

function validateUserId(value) {
    const userId = Number(value);
    return Number.isInteger(userId) && userId > 0 ? userId : null;
}

exports.getMessages = async (req, res) => {
    try {
        const userId = validateUserId(req.params.userId);
        if (!userId) return res.status(400).json({ success: false, message: 'Mã người dùng không hợp lệ.' });
        const data = await TinNhan.getByUserId(userId);
        await TinNhan.markRead(userId, 'Admin');
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getConversations = async (req, res) => {
    try {
        res.json({ success: true, data: await TinNhan.getConversations() });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const userId = validateUserId(req.body.userId);
        const sender = req.body.sender === 'Admin' ? 'Admin' : 'NguoiDung';
        const message = String(req.body.message || '').trim();
        if (!userId || !message) return res.status(400).json({ success: false, message: 'Tin nhắn không hợp lệ.' });
        const data = await TinNhan.create({ userId, sender, message });
        realtime.broadcast({ type: 'chat.message', message: data });
        res.status(201).json({ success: true, data });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.markRead = async (req, res) => {
    try {
        const userId = validateUserId(req.params.userId);
        const sender = req.body.sender === 'NguoiDung' ? 'NguoiDung' : 'Admin';
        if (!userId) return res.status(400).json({ success: false, message: 'Mã người dùng không hợp lệ.' });
        await TinNhan.markRead(userId, sender);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
