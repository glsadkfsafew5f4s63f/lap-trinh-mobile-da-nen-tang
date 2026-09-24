const db=require('../common/db');

function priceExpr(alias='sp') {
    return `CASE WHEN EXISTS (SELECT 1 FROM SanPhamChuongTrinhGiamGia spct JOIN ChuongTrinhGiamGia ctg ON ctg.MaChuongTrinh=spct.MaChuongTrinh WHERE spct.MaSanPham=${alias}.MaSanPham AND ctg.TrangThai=1 AND NOW() BETWEEN ctg.NgayBatDau AND ctg.NgayKetThuc) THEN ${alias}.GiaBan ELSE ${alias}.GiaBan END`;
}

exports.list=async(req,res)=>{
 try{
  const page=Math.max(Number(req.query.page)||1,1), limit=Math.min(Math.max(Number(req.query.limit)||12,1),100), offset=(page-1)*limit;
  const where=[`sp.TrangThai='DANG_BAN'`], p=[];
  const keyword=(req.query.keyword||'').trim();
  if(keyword){where.push(`(sp.TenSanPham LIKE ? OR sp.MaSanPhamCode LIKE ?)`); const k=`%${keyword}%`; p.push(k,k);}
  if(req.query.categoryId){where.push('sp.MaDanhMuc=?');p.push(req.query.categoryId);}
  if(req.query.brandId){where.push('sp.MaThuongHieu=?');p.push(req.query.brandId);}
  if(req.query.gender){where.push('sp.GioiTinh=?');p.push(req.query.gender);}
  if(req.query.minPrice!==undefined){where.push('sp.GiaBan>=?');p.push(Number(req.query.minPrice)||0);}
  if(req.query.maxPrice!==undefined){where.push('sp.GiaBan<=?');p.push(Number(req.query.maxPrice)||0);}
  const whereSql=where.join(' AND ');
  const [[count]]=await db.query(`SELECT COUNT(*) total FROM SanPham sp WHERE ${whereSql}`,p);
  const [rows]=await db.query(`SELECT sp.MaSanPham,sp.MaSanPhamCode,sp.TenSanPham,sp.GiaBan,sp.MoTa,sp.ChatLieu,sp.GioiTinh,sp.NoiBat,sp.LuotXem,dm.TenDanhMuc,th.TenThuongHieu,
    (SELECT ha.DuongDanAnh FROM HinhAnhSanPham ha WHERE ha.MaSanPham=sp.MaSanPham ORDER BY ha.LaAnhChinh DESC,ha.ThuTu ASC LIMIT 1) AnhChinh,
    COALESCE((SELECT SUM(GREATEST(bt.SoLuongTon-bt.SoLuongTamGiu,0)) FROM BienTheSanPham bt WHERE bt.MaSanPham=sp.MaSanPham AND bt.TrangThai=1),0) SoLuongCoTheBan,
    COALESCE((SELECT MIN(COALESCE((SELECT CASE WHEN ctg.LoaiGiam='PHAN_TRAM' THEN GREATEST(bt2.GiaBan-(bt2.GiaBan*ctg.GiaTriGiam/100),0) ELSE GREATEST(bt2.GiaBan-ctg.GiaTriGiam,0) END FROM BienTheChuongTrinhGiamGia bct JOIN ChuongTrinhGiamGia ctg ON ctg.MaChuongTrinh=bct.MaChuongTrinh WHERE bct.MaBienThe=bt2.MaBienThe AND ctg.TrangThai=1 AND NOW() BETWEEN ctg.NgayBatDau AND ctg.NgayKetThuc ORDER BY CASE WHEN ctg.LoaiGiam='PHAN_TRAM' THEN bt2.GiaBan*ctg.GiaTriGiam/100 ELSE ctg.GiaTriGiam END DESC LIMIT 1),(SELECT CASE WHEN ctg.LoaiGiam='PHAN_TRAM' THEN GREATEST(bt2.GiaBan-(bt2.GiaBan*ctg.GiaTriGiam/100),0) ELSE GREATEST(bt2.GiaBan-ctg.GiaTriGiam,0) END FROM SanPhamChuongTrinhGiamGia sct JOIN ChuongTrinhGiamGia ctg ON ctg.MaChuongTrinh=sct.MaChuongTrinh WHERE sct.MaSanPham=bt2.MaSanPham AND ctg.TrangThai=1 AND NOW() BETWEEN ctg.NgayBatDau AND ctg.NgayKetThuc ORDER BY CASE WHEN ctg.LoaiGiam='PHAN_TRAM' THEN bt2.GiaBan*ctg.GiaTriGiam/100 ELSE ctg.GiaTriGiam END DESC LIMIT 1),bt2.GiaBan)) FROM BienTheSanPham bt2 WHERE bt2.MaSanPham=sp.MaSanPham AND bt2.TrangThai=1),sp.GiaBan) GiaTu
    FROM SanPham sp LEFT JOIN DanhMuc dm ON dm.MaDanhMuc=sp.MaDanhMuc LEFT JOIN ThuongHieu th ON th.MaThuongHieu=sp.MaThuongHieu
    WHERE ${whereSql} ORDER BY sp.NoiBat DESC,sp.NgayTao DESC LIMIT ? OFFSET ?`,[...p,limit,offset]);
  res.json({success:true,data:rows,pagination:{page,limit,total:Number(count.total),totalPages:Math.ceil(Number(count.total)/limit)}});
 }catch(e){res.status(500).json({success:false,message:e.message});}
};

exports.detail=async(req,res)=>{
 try{
  const [rows]=await db.query(`SELECT sp.*,dm.TenDanhMuc,th.TenThuongHieu FROM SanPham sp LEFT JOIN DanhMuc dm ON dm.MaDanhMuc=sp.MaDanhMuc LEFT JOIN ThuongHieu th ON th.MaThuongHieu=sp.MaThuongHieu WHERE sp.MaSanPham=? AND sp.TrangThai<>'NGUNG_BAN'`,[req.params.id]);
  if(!rows.length)return res.status(404).json({success:false,message:'Không tìm thấy sản phẩm.'});
  await db.query(`UPDATE SanPham SET LuotXem=LuotXem+1 WHERE MaSanPham=?`,[req.params.id]);
  const [variants]=await db.query(`SELECT bt.MaBienThe,bt.SKU,bt.GiaBan,bt.GiaNhap,bt.SoLuongTon,bt.SoLuongTamGiu,bt.SoLuongDaBan,bt.TrangThai,ms.MaMauSac,ms.TenMau,ms.MaMauHex,kt.MaKichThuoc,kt.TenKichThuoc,GREATEST(bt.SoLuongTon-bt.SoLuongTamGiu,0) SoLuongCoTheBan,COALESCE((SELECT CASE WHEN ctg.LoaiGiam='PHAN_TRAM' THEN GREATEST(bt.GiaBan-(bt.GiaBan*ctg.GiaTriGiam/100),0) ELSE GREATEST(bt.GiaBan-ctg.GiaTriGiam,0) END FROM BienTheChuongTrinhGiamGia bct JOIN ChuongTrinhGiamGia ctg ON ctg.MaChuongTrinh=bct.MaChuongTrinh WHERE bct.MaBienThe=bt.MaBienThe AND ctg.TrangThai=1 AND NOW() BETWEEN ctg.NgayBatDau AND ctg.NgayKetThuc ORDER BY CASE WHEN ctg.LoaiGiam='PHAN_TRAM' THEN bt.GiaBan*ctg.GiaTriGiam/100 ELSE ctg.GiaTriGiam END DESC LIMIT 1),(SELECT CASE WHEN ctg.LoaiGiam='PHAN_TRAM' THEN GREATEST(bt.GiaBan-(bt.GiaBan*ctg.GiaTriGiam/100),0) ELSE GREATEST(bt.GiaBan-ctg.GiaTriGiam,0) END FROM SanPhamChuongTrinhGiamGia sct JOIN ChuongTrinhGiamGia ctg ON ctg.MaChuongTrinh=sct.MaChuongTrinh WHERE sct.MaSanPham=bt.MaSanPham AND ctg.TrangThai=1 AND NOW() BETWEEN ctg.NgayBatDau AND ctg.NgayKetThuc ORDER BY CASE WHEN ctg.LoaiGiam='PHAN_TRAM' THEN bt.GiaBan*ctg.GiaTriGiam/100 ELSE ctg.GiaTriGiam END DESC LIMIT 1),bt.GiaBan) GiaSauGiam FROM BienTheSanPham bt LEFT JOIN MauSac ms ON ms.MaMauSac=bt.MaMauSac LEFT JOIN KichThuoc kt ON kt.MaKichThuoc=bt.MaKichThuoc WHERE bt.MaSanPham=? ORDER BY bt.MaBienThe`,[req.params.id]);
  const [images]=await db.query(`SELECT MaHinhAnh,DuongDanAnh,MoTa,LaAnhChinh,ThuTu FROM HinhAnhSanPham WHERE MaSanPham=? ORDER BY LaAnhChinh DESC,ThuTu ASC`,[req.params.id]);
  const [reviews]=await db.query(`SELECT dg.MaDanhGia,dg.SoSao,dg.NoiDung,dg.HinhAnh,dg.NgayDanhGia,dg.NoiDungPhanHoi,dg.NgayPhanHoi,nd.HoTen FROM DanhGia dg JOIN NguoiDung nd ON nd.MaNguoiDung=dg.MaNguoiDung WHERE dg.MaSanPham=? AND dg.TrangThai=1 ORDER BY dg.NgayDanhGia DESC`,[req.params.id]);
  res.json({success:true,data:{...rows[0],variants,images,reviews}});
 }catch(e){res.status(500).json({success:false,message:e.message});}
};
