import { createUser, validateUser, generateToken } from "../services/auth.services.js";


export const signup = async (req, res) => {
  try {
    const user = await createUser(req.body); 
    const token = generateToken(user);
    res.status(201).json({ user, token });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    console.log("🔐 Login attempt:", req.body.email);
    const user = await validateUser(req.body.email, req.body.password);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const token = generateToken(user);
    console.log("✅ Login successful:", user.email);
    res.status(200).json({ user, token });
  } catch (err) {
    console.error("❌ Login error:", err.message);
    console.error("❌ Login error stack:", err.stack);
    res.status(500).json({ message: err.message || "Internal server error" });
  }
};

