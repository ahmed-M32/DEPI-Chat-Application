import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../api/auth.jsx";
import { useAuth } from "../context/user-context.jsx";
import styles from "./Signup.module.css";

const SignupPage = () => {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
		fullName: "",
	});
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();
	const { login } = useAuth();

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);
		try {
			const response = await register(formData);
			if (response.success) {
				const user = response.data?.user ?? response.data?.data?.user;
				const token = response.data?.token ?? response.data?.data?.token;
				if (user && token) {
					login(user, token);
					navigate("/chats");
				} else {
					setError("Registration succeeded but session could not be started.");
				}
			} else {
				setError(response.message || "Registration failed");
			}
		} catch (err) {
			setError("An error occurred during registration");
			console.error("Registration error:", err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className={styles.page}>
			<div className={styles.card}>
				<h1 className={styles.title}>Create account</h1>
				<p className={styles.subtitle}>Join DEPI Chat</p>

				{error && (
					<div className={styles.errorMessage} role="alert">
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} className={styles.form} noValidate>
					<div className={styles.formGroup}>
						<label htmlFor="signup-fullName">Full name</label>
						<input
							id="signup-fullName"
							type="text"
							name="fullName"
							value={formData.fullName}
							onChange={handleChange}
							placeholder="Your name"
							required
							disabled={loading}
							autoComplete="name"
							aria-invalid={!!error}
						/>
					</div>
					<div className={styles.formGroup}>
						<label htmlFor="signup-email">Email</label>
						<input
							id="signup-email"
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
						<label htmlFor="signup-password">Password</label>
						<input
							id="signup-password"
							type="password"
							name="password"
							value={formData.password}
							onChange={handleChange}
							placeholder="At least 6 characters"
							required
							disabled={loading}
							minLength={6}
							autoComplete="new-password"
							aria-invalid={!!error}
						/>
					</div>
					<button
						type="submit"
						className={styles.primaryButton}
						disabled={loading}
						aria-busy={loading}
					>
						{loading ? "Creating account…" : "Create account"}
					</button>
				</form>

				<p className={styles.footer}>
					Already have an account? <Link to="/login">Sign in</Link>
				</p>
			</div>
		</div>
	);
};
export default SignupPage;
