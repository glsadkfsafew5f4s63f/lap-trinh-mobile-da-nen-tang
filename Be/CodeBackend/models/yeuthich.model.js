const Yeuthich = {};

const db = require('../common/db');

Yeuthich.getAll = async () => {
    const [rows] = await db.query('SELECT * FROM `yeuthich`');
    return rows;
};

Yeuthich.getById = async (id) => {
    const [rows] = await db.query('SELECT * FROM `yeuthich` WHERE `MaYeuThich` = ?', [id]);
    return rows[0] || null;
};

Yeuthich.create = async (data) => {
    const [result] = await db.query('INSERT INTO `yeuthich` SET ?', [data]);
    return { insertId: result.insertId, affectedRows: result.affectedRows };
};

Yeuthich.update = async (id, data) => {
    const [result] = await db.query('UPDATE `yeuthich` SET ? WHERE `MaYeuThich` = ?', [data, id]);
    return { affectedRows: result.affectedRows, changedRows: result.changedRows };
};

Yeuthich.delete = async (id) => {
    const [result] = await db.query('DELETE FROM `yeuthich` WHERE `MaYeuThich` = ?', [id]);
    return { affectedRows: result.affectedRows };
};

module.exports = Yeuthich;
