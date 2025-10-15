import prisma from "../DB/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { 
        expiresIn: "7d" });
};

export const signup = async (req, res) => {
    const { email, password } = req.body;
    try {
        //Check if user exists
        const userExists = await prisma.User.findUnique({
            where: { email },
        });
        if(userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        //Create a user
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.User.create({
            data: { email, password: hashedPassword },
        });
        if(user) {
            res.status(201).json({
                id: user.id,
                email: user.email,
                role: user.role,
                token: generateToken(user.id),
            });
        } else {
            return res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
    
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.User.findUnique({
            where: { email },
        });
        if(user && (await bcrypt.compare(password, user.password))) {
            res.status(200).json({ 
                message: "Logged in successfully", 
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    token: generateToken(user.id, user.role),
                }
            });
        } else {
            res.status(401).json({ message: "Invalid credentials" });
        }
                
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });

    }
};
