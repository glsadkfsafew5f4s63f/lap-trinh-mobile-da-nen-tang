const Lienhe = {};

const db = require('../common/db');

Lienhe.getAll = async () => {
    const [rows] = await db.query('SELECT * FROM `lienhe`');
    return rows;
};

Lienhe.getById = async (id) => {
    const [rows] = await db.query('SELECT * FROM `lienhe` WHERE `MaLienHe` = ?', [id]);
    return rows[0] || null;
};

Lienhe.create = async (data) => {
    const [result] = await db.query('INSERT INTO `lienhe` SET ?', [data]);
    return { insertId: result.insertId, affectedRows: result.affectedRows };
};

Lienhe.update = async (id, data) => {
    const [result] = await db.query('UPDATE `lienhe` SET ? WHERE `MaLienHe` = ?', [data, id]);
    return { affectedRows: result.affectedRows, changedRows: result.changedRows };
};

Lienhe.delete = async (id) => {
    const [result] = await db.query('DELETE FROM `lienhe` WHERE `MaLienHe` = ?', [id]);
    return { affectedRows: result.affectedRows };
};

Lienhe.search = async (keyword) => {
    const sql = 'SELECT * FROM `lienhe` WHERE `HoTen` LIKE ? OR `Email` LIKE ? OR `SoDienThoai` LIKE ? OR `ChuDe` LIKE ? OR `NoiDung` LIKE ?';
    const paramsValue = [keyword, keyword, keyword, keyword, keyword];
    const [rows] = await db.query(sql, paramsValue);
    return rows;
};

module.exports = Lienhe;
