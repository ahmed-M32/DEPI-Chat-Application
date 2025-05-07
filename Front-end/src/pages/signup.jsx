import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../api/auth.jsx";
import { useUser } from "../context/user-context.jsx";
import "./signup.css";


const SignupPage = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        fullName: ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useUser();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await register(formData);
            if (response.success) {
                login(response.data.user, response.data.token);
                navigate("/chats");
            } else {
                setError(response.message);
            }
        } catch (error) {
            setError("An error occurred during registration");
            console.error("Registration error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-card">
                <h2>Create Account</h2>
                <p className="subtitle">Join DEPI Chat</p>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="signup-form">
                    <div className="form-group">
                        <label htmlFor="fullName">Full Name</label>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Create a password"
                            required
                            disabled={loading}
                            minLength={6}
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="signup-button"
                        disabled={loading}
                    >
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>
                </form>

                <p className="login-link">
                    Already have an account? <a href="/login">Sign in</a>
                </p>
            </div>
            <div className="img-container" >
                <img className="login-img" src="imgs/login.png" alt="" />
            </div>
        </div>
    );
};

export default SignupPage;
