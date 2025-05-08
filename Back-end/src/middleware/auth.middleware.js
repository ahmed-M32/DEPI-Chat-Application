import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const checkAuthentication = async (req, res, next) => {
    try {
        // Get token from cookie or header
        let token = req.cookies.jwt;
        
        // If no token in cookies, check headers
        if (!token) {
            token = req.header('x-auth-token') || req.header('Authorization');
            
            // If token is in Authorization header with Bearer prefix
            if (token && token.startsWith('Bearer ')) {
                token = token.slice(7);
            }
        }

        if (!token) {
            console.log('No token found in cookies or headers:', {
                cookies: req.cookies,
                headers: req.headers
            });
            return res
                .status(401)
                .json({ message: "No authentication token found" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded || !decoded.userId) {
            return res.status(401).json({ message: "Unauthorized - invalid token" });
        }

        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(401).json({ message: "User not authorized" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        res.status(401).json({ message: "Authentication failed" });
    }
};
