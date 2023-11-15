const multer = require("multer");
const path = require("path");
// Multer config
module.exports = multer({
  storage: multer.diskStorage({}),
  fileFilter: (req, file, cb) => {
    let ext = path.extname(file.originalname);
    if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png" && ext !== ".webp") {
      // cb(new Error("Unsupported file type!"), false);
      // return;
      // 👆👆 was the original , but was unable to catch the error send by the callback. So sent true with the error msg.
      req.multerError = "Unsupported file type";
      cb(null, true);
      return;
    }
    cb(null, true);
  },
});
