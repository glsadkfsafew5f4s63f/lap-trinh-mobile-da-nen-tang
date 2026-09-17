const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadDirectory = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, uploadDirectory),
    filename: (_req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const safeName = path.basename(file.originalname, extension).replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 60);
        callback(null, `${Date.now()}-${safeName || 'image'}${extension}`);
    },
});

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

module.exports = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024, files: 8 },
    fileFilter: (_req, file, callback) => {
        if (!allowedTypes.has(file.mimetype)) {
            return callback(new Error('Chỉ hỗ trợ ảnh JPG, PNG, WEBP hoặc GIF.'));
        }
        callback(null, true);
    },
});
