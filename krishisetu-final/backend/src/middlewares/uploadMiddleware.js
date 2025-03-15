const multer = require("multer");
const path = require("path");

// 📍 Set Storage Engine
const storage = multer.diskStorage({
    destination: "./uploads/",
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    }
});

// 📍 File Filter (Only Allow Images & PDFs)
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type"), false);
    }
};

// 📍 Upload Middleware
const upload = multer({ storage, fileFilter });

module.exports = upload;
