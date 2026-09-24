const Bienthechuongtrinhgiamgia = {};

const db = require('../common/db');

Bienthechuongtrinhgiamgia.getAll = async () => {
    const [rows] = await db.query('SELECT * FROM `bienthechuongtrinhgiamgia`');
    return rows;
};

Bienthechuongtrinhgiamgia.getById = async (id) => {
    const [rows] = await db.query('SELECT * FROM `bienthechuongtrinhgiamgia` WHERE `MaBienTheChuongTrinh` = ?', [id]);
    return rows[0] || null;
};

Bienthechuongtrinhgiamgia.create = async (data) => {
    const [result] = await db.query('INSERT INTO `bienthechuongtrinhgiamgia` SET ?', [data]);
    return { insertId: result.insertId, affectedRows: result.affectedRows };
};

Bienthechuongtrinhgiamgia.update = async (id, data) => {
    const [result] = await db.query('UPDATE `bienthechuongtrinhgiamgia` SET ? WHERE `MaBienTheChuongTrinh` = ?', [data, id]);
    return { affectedRows: result.affectedRows, changedRows: result.changedRows };
};

Bienthechuongtrinhgiamgia.delete = async (id) => {
    const [result] = await db.query('DELETE FROM `bienthechuongtrinhgiamgia` WHERE `MaBienTheChuongTrinh` = ?', [id]);
    return { affectedRows: result.affectedRows };
};

module.exports = Bienthechuongtrinhgiamgia;
