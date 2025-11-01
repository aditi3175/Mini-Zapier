import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { getProfile, updateProfile, uploadAvatar } from "../controllers/profile.controller.js";

const router = Router();

// avatar upload storage
const uploadsDir = path.resolve("uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".png";
    cb(null, `avatar_${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

router.get("/", authenticateToken, getProfile);
router.put("/", authenticateToken, updateProfile);
router.post("/avatar", authenticateToken, upload.single("avatar"), uploadAvatar);

export default router;


