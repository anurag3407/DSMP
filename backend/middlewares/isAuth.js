import jwt from 'jsonwebtoken';
import { User } from '../models/userModel.js';

export const isAuth = async (req, res, next) => {
    try {
        // Check for token in cookies first (JWT from login/register)
        let token = req.cookies?.token;
        
        // If no cookie token, check Authorization header
        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        if (!token) {
            return res.status(401).json({ message: "Please Login" });
        }

        const decodedData = jwt.verify(token, process.env.JWT_SECRET);

        if (!decodedData) {
            return res.status(401).json({ message: "Token is invalid" });
        }

        req.user = await User.findById(decodedData.id);
        
        if (!req.user) {
            return res.status(401).json({ message: "User not found" });
        }

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ message: "Please Login" });
    }
};