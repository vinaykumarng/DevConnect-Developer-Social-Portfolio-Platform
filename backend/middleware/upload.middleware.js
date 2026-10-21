import multer from 'multer';

// Keep the file in memory as a buffer — we pipe it straight to Cloudinary,
// never touch the server's disk (important since disk storage won't
// survive a redeploy on most hosts anyway)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPEG, PNG, WEBP, and GIF images are allowed'), false);
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});