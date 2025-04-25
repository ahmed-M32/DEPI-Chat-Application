import { generateJwtToken } from "../lib/utils.js";
import { User } from "../models/user.model.js";
import v2 from "../lib/cloudinary.js";
import bcrypt from "bcryptjs";

export const register = async (req, res) => {
	const userData = req.body;
	console.log(req.body);

	try {
		if (userData.password.length < 6) {
			return res
				.status(401)
				.json({ message: "Password must be at least 6 characters long" });
		}
		const existingUser = await User.findOne({ email: userData.email });
		if (existingUser) {
			return res
				.status(402)
				.json({ message: "User with this email already exists" });
		}

		const salt = await bcrypt.genSalt(12);
		const hashPassword = await bcrypt.hash(userData.password, salt);
		const newUser = new User({
			fullName: userData.fullName,
			password: hashPassword,
			email: userData.email,
		});

		if (newUser) {
			const token = generateJwtToken(newUser._id, res);
			await newUser.save();

			res.status(200).json({
				_id: newUser._id,
				fullName: newUser.fullName,
				email: newUser.email,
				token: token,
				profilePicture: newUser.profilePicture,
			});
		} else {
			res.status(400).json({ message: "user data error" });
		}

		return res
			.status(201)
			.json({ message: "User created successfully", newUser });
	} catch (error) {
		console.log("sign up error", error.message);
	}
};

export const login = async (req, res) => {
	const userData = req.body;
	try {
		const user = await User.findOne({ email: userData.email });
		if (!user) {
			return res.status(400).json({ message: "this user doesn't exist" });
		}
		const validPassword = await bcrypt.compare(
			userData.password,
			user.password
		);
		if (!validPassword) {
			return res.status(401).json({ message: "wrong password" });
		}
		generateJwtToken(user._id, res);
		res.status(200).json({
			_id: user._id,
			fullName: user.fullName,
			email: user.email,
			profilePicture: user.profilePicture,
		});
	} catch (error) {
		console.log("login error", error.message);
	}
};

export const logout = async (req, res) => {
	res.clearCookie("jwt");
	res.status(200).json({ message: "logged out" });
};
export const updateProfilePic = async (req, res) => {
	try {
		const userID = req.user._id;
		if (!req.body.profilePicture) {
			return res.status(400).json({ message: "Profile Picture is required" });
		}

		const response = await v2.uploader.upload(req.body.profilePicture);
		const updateUser = await User.findByIdAndUpdate(
			userID,
			{
				profilePicture: response.secure_url,
			},
			{ new: true }
		);

		if (updateUser) {
		}
	} catch (error) {
		res.status(500).json({ message: "internal server error" });
	}
};
