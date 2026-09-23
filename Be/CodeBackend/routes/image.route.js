const express = require('express');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/upload', (req, res) => {
    upload.array('images', 8)(req, res, (error) => {
        if (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
        const data = (req.files || []).map((file) => `${req.protocol}://${req.get('host')}/uploads/${file.filename}`);
        res.status(201).json({ success: true, data });
    });
});

module.exports = router;
