import jwt from "jsonwebtoken";

export const generateJwtToken = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "2d",
    });

    // Set cookie
    res.cookie("jwt", token, {
        maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
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
