import { generateJwtToken } from "../lib/utils.js";
import { User } from "../models/user.model.js";
import v2 from "../lib/cloudinary.js";
import bcrypt from "bcryptjs";

export const register = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        if (!fullName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long"
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists"
            });
        }

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword
        });

        await newUser.save();

        const token = generateJwtToken(newUser._id, res);

        res.status(201).json({
            success: true,
            data: {
                user: {
                    _id: newUser._id,
                    fullName: newUser.fullName,
                    email: newUser.email,
                    profilePicture: newUser.profilePicture
                },
                token
            }
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred during registration"
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and password"
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = generateJwtToken(user._id, res);

        res.status(200).json({
            success: true,
            data: {
                user: {
                    _id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    profilePicture: user.profilePicture
                },
                token
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred during login"
        });
    }
};

export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            data: {
                user
            }
        });
    } catch (error) {
        console.error("Get current user error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get current user"
        });
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie("jwt");
        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred during logout"
        });
    }
};

v2.config({
    cloud_name: process.env.CLOUDINARY_USERNAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const updateProfilePicture = async (req, res) => {
    try {
        const userId = req.user._id;
        const { image } = req.body;

        if (!image) {
            return res.status(400).json({
                success: false,
                message: 'No image provided'
            });
        }

        // Upload image to Cloudinary
        const uploadResponse = await v2.uploader.upload(image, {
            folder: 'profile_pictures',
            transformation: [
                { width: 500, height: 500, crop: 'fill' },
                { quality: 'auto' }
            ]
        });

        // Update user's profile picture URL
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePicture: uploadResponse.secure_url },
            { new: true }
        ).select('-password');

        res.json({
            success: true,
            data: {
                user: updatedUser
            }
        });
    } catch (error) {
        console.error('Error updating profile picture:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile picture'
        });
    }
};

export const removeProfilePicture = async (req, res) => {
    try {
        const userId = req.user._id;

        // Update user to remove profile picture
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePicture: null },
            { new: true }
        ).select('-password');

        res.json({
            success: true,
            data: {
                user: updatedUser
            }
        });
    } catch (error) {
        console.error('Error removing profile picture:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing profile picture'
        });
    }
};
