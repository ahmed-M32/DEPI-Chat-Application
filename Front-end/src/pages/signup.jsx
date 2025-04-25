/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { signup } from "../api/auth.jsx";
import { useNavigate } from "react-router-dom";

const Signup = () => {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const navigate = useNavigate();

	async function handleSubmisssion(e) {
		e.preventDefault();
		const data = {
			fullName: name,
			email: email,
			password: password,
		};
		const res = await signup(data);
		console.log(res);
		
		if (res.success) {
			console.log("sign up success");
			
			navigate('/login');
		} else {
			if (res.code === 402) {
				console.log(res);

				console.log("a user with this email already exists");
			} else {
				console.log("password must be more than 6 characters");
			}
		}
	}
	return (
		<form onSubmit={handleSubmisssion}>
			<div className="user-name">
				<label htmlFor="username">Username</label>
				<input
					type="text"
					id="username"
					placeholder="username"
					onInput={(e) => setName(e.target.value)}
				/>
			</div>
			<div>
				<label htmlFor="email">E-Mail</label>
				<input
					type="email"
					id="email"
					placeholder="email"
					onInput={(e) => setEmail(e.target.value)}
				/>
			</div>
			<div className="password">
				<label htmlFor="password">Password</label>
				<input
					type="password"
					placeholder="password"
					onInput={(e) => setPassword(e.target.value)}
				/>
			</div>

			<div className="submit">
				<input type="submit" value="submit" id="submit" />
			</div>
		</form>
	);
};

export default Signup;
