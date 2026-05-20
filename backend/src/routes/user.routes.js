const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, changePassword, uploadAvatar, deleteAccount, getAllUsers } = require('../controllers/user.controller');
const { protect, requireAdmin } = require('../middlewares/auth.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `avatar-${req.user._id}-${Date.now()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const isValid = allowedTypes.test(file.mimetype) && allowedTypes.test(path.extname(file.originalname).toLowerCase());
        cb(isValid ? null : new Error('Only image files are allowed'), isValid);
    }
});

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);
router.delete('/account', protect, deleteAccount);
router.get('/', protect, requireAdmin, getAllUsers);

module.exports = router;
