import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const __filename = fileURLToPath(import.meta.url)
        const __dirname = path.dirname(__filename)
        cb(null, path.join(__dirname, "../uploads"));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + Math.round(Math.random() * 1e9);
        const filename = file.originalname.split(".")[0];
        // const fileExtension = file.originalname.split(".")[1];
        cb(null, filename + uniqueSuffix + `.png`);
    }
});

export const upload = multer({ storage: storage });




