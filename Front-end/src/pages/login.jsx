/* eslint-disable no-unused-vars */
import React from "react";
import { useState } from "react";
import { login } from "../api/auth.jsx";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const navigate = useNavigate();

	async function handleSubmission(e) {
		e.preventDefault();

		const data = {
			email: email,
			password: password,
		};

		const res = await login(data);
		if (res.success) {
			console.log("sign up success");

			navigate("/home");
		} else {
			if (res.code === 400) {
				console.log(res);

				console.log("this user does not exist");
			} else {
				console.log("wrong password");
			}
		}
	}
	return (
		<form onSubmit={handleSubmission}>
			<div className="email">
				<label htmlFor="email">email</label>
				<input type="email" onInput={(e) => setEmail(e.target.value)} />
			</div>
			<div className="password">
				<label htmlFor="pass">password</label>
				<input
					type="password"
					name="pass"
					id="pass"
					onInput={(e) => setPassword(e.target.value)}
				/>
			</div>
			<div className="submit">
				<input type="submit" value="sign in" />
			</div>
		</form>
	);
};

export default LoginPage;
