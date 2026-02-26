/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/auth.jsx";
import { useAuth } from "../context/user-context.jsx";
import styles from "./Login.module.css";

const LoginPage = () => {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();
	const { login: userLogin } = useAuth();

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);
		try {
			const response = await login(formData);
			if (response.success) {
				const { user, token } = response.data.data;
				userLogin(user, token);
				navigate("/chats");
			} else {
				setError(response.message || "Invalid email or password");
			}
		} catch (err) {
			setError("An error occurred during login");
			console.error("Login error:", err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className={styles.page}>
			<div className={styles.card}>
				<h1 className={styles.title}>Welcome back</h1>
				<p className={styles.subtitle}>Sign in to continue to DEPI Chat</p>

				{error && (
					<div className={styles.errorMessage} role="alert">
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} className={styles.form} noValidate>
					<div className={styles.formGroup}>
						<label htmlFor="login-email">Email</label>
						<input
							id="login-email"
							type="email"
							name="email"
							value={formData.email}
							onChange={handleChange}
							placeholder="you@example.com"
							required
							disabled={loading}
							autoComplete="email"
							aria-invalid={!!error}
						/>
					</div>
					<div className={styles.formGroup}>
						<label htmlFor="login-password">Password</label>
						<input
							id="login-password"
							type="password"
							name="password"
							value={formData.password}
							onChange={handleChange}
							placeholder="••••••••"
							required
							disabled={loading}
							autoComplete="current-password"
							aria-invalid={!!error}
						/>
					</div>
					<button
						type="submit"
						className={styles.primaryButton}
						disabled={loading}
						aria-busy={loading}
					>
						{loading ? "Signing in…" : "Sign in"}
					</button>
				</form>

				<p className={styles.footer}>
					Don&apos;t have an account? <Link to="/">Create one</Link>
				</p>
			</div>
		</div>
	);
};

export default LoginPage;
