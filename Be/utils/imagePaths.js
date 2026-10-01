const fs = require('fs');
const path = require('path');

const uploadsRoot = path.resolve(__dirname, '..', 'uploads');
const imageExtensions = {
    '.jpg': ['.jpg', '.jfif', '.jpeg'],
    '.jpeg': ['.jpeg', '.jpg', '.jfif'],
    '.jfif': ['.jfif', '.jpg', '.jpeg'],
    '.png': ['.png'],
    '.webp': ['.webp'],
};

function toPublicImageUrl(value) {
    if (typeof value !== 'string' || !value.trim()) return null;
    const input = value.trim();
    if (/^https?:\/\//i.test(input)) return input;

    const relative = input.replace(/\\/g, '/').replace(/^\/+/, '').replace(/^uploads\//i, '');
    const candidates = [relative, path.basename(relative)];
    for (const candidate of candidates) {
        const parsed = path.parse(candidate);
        const extensions = imageExtensions[parsed.ext.toLowerCase()] || [parsed.ext];
        for (const extension of extensions) {
            const resolved = path.resolve(uploadsRoot, parsed.dir, `${parsed.name}${extension}`);
            if (!resolved.startsWith(`${uploadsRoot}${path.sep}`)) continue;
            if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
                const publicPath = path.relative(uploadsRoot, resolved).split(path.sep).join('/');
                return `/uploads/${publicPath}`;
            }
        }
    }
    return null;
}

module.exports = { toPublicImageUrl };
