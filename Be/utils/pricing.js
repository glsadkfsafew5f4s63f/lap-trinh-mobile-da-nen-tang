function effectiveVariantPriceSql(alias = 'bt') {
    const variantSaving = `CASE WHEN ctg.LoaiGiam='PHAN_TRAM' THEN ${alias}.GiaBan*ctg.GiaTriGiam/100 ELSE ctg.GiaTriGiam END`;
    const discountedPrice = `CASE WHEN ctg.LoaiGiam='PHAN_TRAM' THEN GREATEST(${alias}.GiaBan-(${alias}.GiaBan*ctg.GiaTriGiam/100),0) ELSE GREATEST(${alias}.GiaBan-ctg.GiaTriGiam,0) END`;

    return `COALESCE(
        (SELECT ${discountedPrice}
         FROM BienTheChuongTrinhGiamGia bct
         JOIN ChuongTrinhGiamGia ctg ON ctg.MaChuongTrinh=bct.MaChuongTrinh
         WHERE bct.MaBienThe=${alias}.MaBienThe
           AND ctg.TrangThai=1
           AND NOW() BETWEEN ctg.NgayBatDau AND ctg.NgayKetThuc
         ORDER BY ${variantSaving} DESC
         LIMIT 1),
        (SELECT ${discountedPrice}
         FROM SanPhamChuongTrinhGiamGia sct
         JOIN ChuongTrinhGiamGia ctg ON ctg.MaChuongTrinh=sct.MaChuongTrinh
         WHERE sct.MaSanPham=${alias}.MaSanPham
           AND ctg.TrangThai=1
           AND NOW() BETWEEN ctg.NgayBatDau AND ctg.NgayKetThuc
         ORDER BY ${variantSaving} DESC
         LIMIT 1),
        ${alias}.GiaBan
    )`;
}

module.exports = { effectiveVariantPriceSql };