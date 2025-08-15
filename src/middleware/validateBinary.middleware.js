import multer from 'multer';

const allowMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf" // Allow PDF
];

const fileFilter = (req, file, cb) => {
    if (allowMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only JPEG, PNG, WEBP images, and PDF files are allowed"));
    }
};

export const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter
});
