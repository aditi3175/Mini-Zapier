import jwt from "jsonwebtoken";
import prisma from "../DB/db.js";

export const authenticateToken = async (req, res, next) => {
  let token;
  console.log("Authenticating token...");
  console.log("Authorization header:", req.headers.authorization);

  // Check if token exists
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];
      console.log("Token received:", token);

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await prisma.User.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          role: true,
        },
      });
      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};