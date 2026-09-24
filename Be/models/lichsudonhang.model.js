const Lichsudonhang = {};

const db = require('../common/db');

Lichsudonhang.getAll = async () => {
    const [rows] = await db.query('SELECT * FROM `lichsudonhang`');
    return rows;
};

Lichsudonhang.getById = async (id) => {
    const [rows] = await db.query('SELECT * FROM `lichsudonhang` WHERE `MaLichSu` = ?', [id]);
    return rows[0] || null;
};

Lichsudonhang.create = async (data) => {
    const [result] = await db.query('INSERT INTO `lichsudonhang` SET ?', [data]);
    return { insertId: result.insertId, affectedRows: result.affectedRows };
};

Lichsudonhang.update = async (id, data) => {
    const [result] = await db.query('UPDATE `lichsudonhang` SET ? WHERE `MaLichSu` = ?', [data, id]);
    return { affectedRows: result.affectedRows, changedRows: result.changedRows };
};

Lichsudonhang.delete = async (id) => {
    const [result] = await db.query('DELETE FROM `lichsudonhang` WHERE `MaLichSu` = ?', [id]);
    return { affectedRows: result.affectedRows };
};

Lichsudonhang.search = async (keyword) => {
    const sql = 'SELECT * FROM `lichsudonhang` WHERE `GhiChu` LIKE ?';
    const paramsValue = [keyword];
    const [rows] = await db.query(sql, paramsValue);
    return rows;
};

module.exports = Lichsudonhang;
