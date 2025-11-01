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
    const user = await validateUser(req.body.email, req.body.password);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const token = generateToken(user);
    res.status(200).json({ user, token });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

