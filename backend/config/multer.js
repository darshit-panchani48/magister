// config/multer.js — Multer + Cloudinary storage

const multer             = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary         = require('./cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:         'magister_profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpg, png, webp, avif)'));
    }
  },
});

module.exports = upload;
