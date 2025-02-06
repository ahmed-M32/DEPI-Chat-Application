import { generateJwtToken } from "../lib/utils.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const register = async (req, res) => {
	const userData = req.body;
    console.log(req.body);
    
	try {
		if (userData.password.length < 6) {
			return res
				.status(400)
				.json({ message: "Password must be at least 6 characters long" });
		}
		const existingUser = await User.findOne({ userData });
		if (existingUser) {
			return res
				.status(400)
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
			generateJwtToken(newUser._id, res);
			await newUser.save();

			res.status(200).json({
				_id: newUser._id,
				fullName: newUser.fullName,
				email: newUser.email,
				profilePicture: newUser.profilePicture,
			});
		} else {
			res.status(400).json({ message: "user data error" });
		}

		return res.status(201).json({ message: "User created successfully", user });
	} catch (error) {
		console.log("sign up error", error.message);
	}
};
