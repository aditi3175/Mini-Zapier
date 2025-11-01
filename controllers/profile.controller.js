import prisma from "../DB/db.js";
import bcrypt from "bcryptjs";

export const getProfile = async (req, res) => {
  try {
    const user = await prisma.User.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, avatarUrl: true, role: true },
    });
    return res.status(200).json({ user });
  } catch (e) {
    return res.status(500).json({ message: "Failed to fetch profile" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { email, name, password } = req.body || {};
    const data = {};
    if (email) data.email = email;
    if (name !== undefined) data.name = name;
    if (password) data.password = await bcrypt.hash(password, 10);
    const user = await prisma.User.update({
      where: { id: req.user.id },
      data,
      select: { id: true, email: true, name: true, avatarUrl: true, role: true },
    });
    return res.status(200).json({ user });
  } catch (e) {
    return res.status(500).json({ message: "Failed to update profile" });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file uploaded" });
    const publicUrl = `/uploads/${file.filename}`;
    await prisma.User.update({ where: { id: req.user.id }, data: { avatarUrl: publicUrl } });
    return res.status(200).json({ avatarUrl: publicUrl });
  } catch (e) {
    return res.status(500).json({ message: "Failed to upload avatar" });
  }
};


