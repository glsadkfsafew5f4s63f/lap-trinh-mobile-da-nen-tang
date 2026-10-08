const db = require('../common/db');

const calculateLongAgedStock = (movements, cutoff) => {
    const items = [];
    let currentId = null;
    let currentStock = null;
    let lots = [];
    let nextLotIndex = 0;

    const collectAgedStock = () => {
        if (!currentStock) return;
        const agedLots = lots.filter(
            (lot) => lot.date && lot.date < cutoff && lot.quantity > 0,
        );
        const agedQuantity = agedLots.reduce((sum, lot) => sum + lot.quantity, 0);
        if (agedQuantity > 0) {
            items.push({
                ...currentStock,
                SoLuongLauNam: agedQuantity,
                NgayTonKhoCuNhat: agedLots.reduce(
                    (oldest, lot) => lot.date < oldest ? lot.date : oldest,
                    agedLots[0].date,
                ),
            });
        }
    };

    for (const movement of movements) {
        if (movement.MaBienThe !== currentId) {
            collectAgedStock();
            currentId = movement.MaBienThe;
            currentStock = {
                MaBienThe: movement.MaBienThe,
                SKU: movement.SKU,
                TenSanPham: movement.TenSanPham,
                TenMau: movement.TenMau,
                TenKichThuoc: movement.TenKichThuoc,
                SoLuongTon: Number(movement.SoLuongTon),
                SoLuongTamGiu: Number(movement.SoLuongTamGiu),
                SoLuongCoTheBan: Number(movement.SoLuongCoTheBan),
            };
            lots = [];
            nextLotIndex = 0;
            const openingQuantity = Number(movement.TonTruoc);
            if (openingQuantity > 0) {
                lots.push({ quantity: openingQuantity, date: null });
            }
        }

        const difference = Number(movement.TonSau) - Number(movement.TonTruoc);
        if (difference > 0) {
            lots.push({ quantity: difference, date: new Date(movement.NgayTao) });
        } else if (difference < 0) {
            let quantityToRemove = -difference;
            while (quantityToRemove > 0 && nextLotIndex < lots.length) {
                const lot = lots[nextLotIndex];
                const removed = Math.min(lot.quantity, quantityToRemove);
                lot.quantity -= removed;
                quantityToRemove -= removed;
                if (lot.quantity === 0) nextLotIndex += 1;
            }
        }
    }

    collectAgedStock();
    return items;
};

const getLongAgedStock = async () => {
    const [movements] = await db.query(`
        SELECT bt.MaBienThe, bt.SKU, sp.TenSanPham, ms.TenMau, kt.TenKichThuoc,
               bt.SoLuongTon, bt.SoLuongTamGiu,
               GREATEST(bt.SoLuongTon - bt.SoLuongTamGiu, 0) SoLuongCoTheBan,
               ls.TonTruoc, ls.TonSau, ls.NgayTao
        FROM BienTheSanPham bt
        JOIN LichSuTonKho ls ON ls.MaBienThe = bt.MaBienThe
        JOIN SanPham sp ON sp.MaSanPham = bt.MaSanPham
        LEFT JOIN MauSac ms ON ms.MaMauSac = bt.MaMauSac
        LEFT JOIN KichThuoc kt ON kt.MaKichThuoc = bt.MaKichThuoc
        WHERE bt.SoLuongTon > 0
        ORDER BY bt.MaBienThe, ls.NgayTao, ls.MaLichSuTonKho
    `);
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 1);
    return calculateLongAgedStock(movements, cutoff);
};

module.exports = getLongAgedStock;
module.exports.calculateLongAgedStock = calculateLongAgedStock;
