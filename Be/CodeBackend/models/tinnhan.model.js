const db = require('../common/db');

const TinNhan = {};

TinNhan.getByUserId = async (userId) => {
    const [rows] = await db.query(
        `SELECT MaTinNhan AS id, MaNguoiDung AS userId, NguoiGui AS sender,
                NoiDung AS message, DaDoc AS isRead, NgayGui AS date
         FROM TinNhan WHERE MaNguoiDung = ? ORDER BY NgayGui ASC, MaTinNhan ASC`,
        [userId]
    );
    return rows;
};

TinNhan.getConversations = async () => {
    const [rows] = await db.query(
        `SELECT nd.MaNguoiDung AS userId, nd.HoTen AS name, nd.SoDienThoai AS phone,
                MAX(tn.NgayGui) AS lastDate,
                SUBSTRING_INDEX(GROUP_CONCAT(tn.NoiDung ORDER BY tn.NgayGui DESC, tn.MaTinNhan DESC), ',', 1) AS lastMessage,
                SUM(CASE WHEN tn.NguoiGui = 'NguoiDung' AND tn.DaDoc = 0 THEN 1 ELSE 0 END) AS unread
         FROM TinNhan tn INNER JOIN NguoiDung nd ON nd.MaNguoiDung = tn.MaNguoiDung
         GROUP BY nd.MaNguoiDung, nd.HoTen, nd.SoDienThoai ORDER BY lastDate DESC`
    );
    return rows;
};

TinNhan.create = async ({ userId, sender, message }) => {
    const [result] = await db.query(
        'INSERT INTO TinNhan (MaNguoiDung, NguoiGui, NoiDung) VALUES (?, ?, ?)',
        [userId, sender, message]
    );
    const [rows] = await db.query(
        `SELECT MaTinNhan AS id, MaNguoiDung AS userId, NguoiGui AS sender,
                NoiDung AS message, DaDoc AS isRead, NgayGui AS date
         FROM TinNhan WHERE MaTinNhan = ?`,
        [result.insertId]
    );
    return rows[0];
};

TinNhan.markRead = async (userId, sender) => {
    await db.query('UPDATE TinNhan SET DaDoc = 1 WHERE MaNguoiDung = ? AND NguoiGui = ?', [userId, sender]);
};

module.exports = TinNhan;
