import prisma from "../DB/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const createUser = async ({ email, password, role = "USER" }) => {
    // Check if user already exists
    const existing = await prisma.User.findUnique({where: {
        email
    }});
    if(existing) throw new Error("User already exist");

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
  
    // Create user in DB
    const user = await prisma.User.create({
      data: {
        email,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        email: true,
        role: true, // never return password
      },
    });
  
    return user;
};
  
// Validate user credentials (login)
export const validateUser = async (email, password) => {
    const user = await prisma.User.findUnique({
      where: { email },
    });
  
    if (!user) throw new Error("User not found");
  
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Password is incorrect");
  
    // Return user without password
    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
};
  
// Generate JWT token
export const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured. Please set JWT_SECRET environment variable.");
  }
  return jwt.sign(
    { id: user.id, role: user.role }, // include id here!
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};
  
// Helper: Verify JWT
export const verifyToken = (token) => {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return null;
    }
  };
  
  
  