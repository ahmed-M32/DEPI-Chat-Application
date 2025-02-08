import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const checkAuthentication = async (req, res, next) => {
	try {
		const token = req.cookies.jwt;

		if (!token) {
			return res
				.status(401)
				.json({ message: "Unauthorized- token doesn't exist" });
		}
		const verified = jwt.verify(token, process.env.JWT_SECRET);

		if (!verified) {
			return res.status(401).json({ message: "Unauthorized- invalid token" });
		}

		const user = await User.findById(verified.payload).select("-password");
        console.log(user);
        
		if (!user) {
			return res.status(401).json({ message: "user not authorized" });
		}
		console.log(user);

		req.user = user;

		next();
	} catch (error) {
		console.log("user not authorized", error.message);
		return res.status(500).json({ message: "internal server error" });
	}
};
