import prisma from "../DB/db.js";
import jwt from "jsonwebtoken";

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const token = authHeader.split(" ")[1];

    // Debug: log token length (don't log full token in prod)
    console.log("Auth token length:", token ? token.length : "no-token");

    // Debug: print JWT secret presence (never print secret in prod)
    console.log("JWT_SECRET present?", !!process.env.JWT_SECRET);

    // Try to verify and catch specific verification error
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Token decoded payload:", decoded);
    } catch (verr) {
      console.error("Token verification error:", verr.message);
      return res.status(401).json({ message: "Invalid token: " + verr.message });
    }

    // Ensure decoded has id
    if (!decoded || (typeof decoded.id === "undefined" && typeof decoded.userId === "undefined")) {
      console.error("Decoded payload missing id:", decoded);
      return res.status(401).json({ message: "Invalid token payload" });
    }

    // support either decoded.id or decoded.userId depending on how token was signed
    const userId = decoded.id ?? decoded.userId;

    // ensure userId is number if your DB uses Int
    const numericUserId = typeof userId === "string" && /^\d+$/.test(userId) ? Number(userId) : userId;

    // fetch minimal user
    req.user = await prisma.User.findUnique({
      where: { id: numericUserId },
      select: { id: true, email: true, role: true },
    });

    if (!req.user) {
      console.error("No user found for id:", numericUserId);
      return res.status(401).json({ message: "User not found" });
    }

    next();
  } catch (err) {
    console.error("Auth middleware unexpected error:", err);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};
