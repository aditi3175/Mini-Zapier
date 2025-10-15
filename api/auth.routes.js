import { Router } from "express";

import { signup, login } from "../controllers/auth.controller.js";
let validateUser, validateLogin;

validateUser = async (req, res, next) => {
    const { email, password, role } = req.body;
    if (!email || !email.includes("@")) {
        return res.status(400).json({ message: "Valid email is required" });
    }
    if (!password || password.length < 6) {
        return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }
    if (!role || !["USER", "ADMIN"].includes(role)) {
        return res.status(400).json({ message: "Valid role is required" });
    }
    next();
};

validateLogin = async (req, res, next) => {
    const { email, password } = req.body;
    if(!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }
    next();
};

const router = Router();

router.post("/signup", validateUser, signup);
router.post("/login", validateLogin, login);

export default router;
