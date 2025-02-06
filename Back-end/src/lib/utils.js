import jwt from "jsonwebtoken";

export const generateJwtToken = (payload, res) => {
	const token = jwt.sign({ payload }, process.env.JWT_SECRET, {
		expiresIn: "2d",
	});
	res.cookie("jwt", token, {
		maxAge: 2 * 24 * 60 * 60 * 1000,
		httpOnly: true,
		sameSite: "strict",
	});

    return token;
};
