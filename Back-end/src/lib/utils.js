import jwt from "jsonwebtoken";

export const generateJwtToken = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "2d",
    });

    
    res.cookie("jwt", token, {
        maxAge: 2 * 24 * 60 * 60 * 1000, 
        httpOnly: true,
        sameSite: "None", 
        secure: true, // Always set secure to true when sameSite is None
        path: "/"    // Ensure cookie is available across all paths
    });

    return token;
};

export const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};
