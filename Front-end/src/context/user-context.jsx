/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { createContext, useState, useContext, useEffect } from "react";
import { getCurrentUser, getStoredToken, setAuthToken, isUserLoggedIn } from "../api/auth.jsx";
import { getUsers } from "../api/message-api.jsx";

const UserContext = createContext();

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem("user");
            return storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;
        } catch (error) {
            console.error("Error parsing user from localStorage:", error);
            localStorage.removeItem("user");
            return null;
        }
    });

    const [token, setToken] = useState(() => getStoredToken());
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Add a useEffect to ensure user data is always saved to localStorage when it changes
    useEffect(() => {
        if (user) {
            localStorage.setItem("user", JSON.stringify(user));
        }
    }, [user]);

    useEffect(() => {
        const validateAuth = async () => {
            // IMPORTANT: First check if we have stored credentials and use them immediately
            // This prevents the login screen flash and maintains state across refreshes
            const loggedIn = isUserLoggedIn();
            const storedUser = localStorage.getItem("user");
            
            if (loggedIn && storedUser && storedUser !== "undefined") {
                try {
                    // We have stored credentials, use them immediately
                    setUser(JSON.parse(storedUser));
                    const storedToken = getStoredToken();
                    if (storedToken) {
                        setToken(storedToken);
                        setAuthToken(storedToken); // Ensure token is set in auth module
                    }
                } catch (error) {
                    console.error("Error parsing user from localStorage:", error);
                    // Clear the invalid data
                    localStorage.removeItem("user");
                }
                
                // Set loading to false immediately if we have stored credentials
                // This allows the UI to render without waiting for API response
                setLoading(false);
            }
            
            // AFTER setting stored credentials, try to validate with the server
            // But don't block the UI on this request
            try {
                console.log('Validating authentication with server...');
                const response = await getCurrentUser();
                
                if (response.success && response.data && response.data.user) {
                    console.log('Authentication validated successfully');
                    // Update with fresh user data from server
                    const userData = response.data.user;
                    
                    // Only update if we have valid user data
                    if (userData && typeof userData === 'object') {
                        setUser(userData);
                        localStorage.setItem("user", JSON.stringify(userData));
                        
                        if (response.data.token) {
                            setToken(response.data.token);
                            setAuthToken(response.data.token);
                        }
                    } else {
                        console.warn('Received invalid user data from server:', userData);
                        // Don't overwrite existing valid user data with invalid data
                    }
                } else if (response.code === 401) {
                    // Only logout if we get a clear 401 Unauthorized
                    // AND we don't have valid stored credentials
                    if (!loggedIn) {
                        console.log("Authentication failed: Unauthorized");
                        handleLogout();
                    }
                }
            } catch (error) {
                console.error("Server validation failed:", error);
                // CRITICAL: On network errors, DO NOT logout if we have stored credentials
                // This ensures the app remains usable during connectivity issues
                if (!loggedIn && !storedUser) {
                    console.log("No stored credentials, redirecting to login");
                    handleLogout();
                } else {
                    console.log("Using stored credentials due to server error");
                }
            } finally {
                // Ensure loading is set to false in all cases
                setLoading(false);
            }
        };

        validateAuth();
    }, []);

    useEffect(() => {
        const fetchUsers = async () => {
            if (!token) return;

            try {
                const response = await getUsers();
                if (response.success) {
                    setUsers(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch users:", error);
            }
        };

        if (token) {
            fetchUsers();
        }
    }, [token]);

    const login = (userData, authToken) => {        
        // Make sure userData is not undefined or null before setting
        if (userData) {
            setUser(userData);
            // Ensure we're storing a valid JSON string
            localStorage.setItem("user", JSON.stringify(userData));
        }
        
        if (authToken) {
            setToken(authToken);
            setAuthToken(authToken);
        }
    };

    const handleLogout = () => {
        setUser(null);
        setToken(null);
        setUsers([]);
        setAuthToken(null);
        localStorage.removeItem("user");
    };

    const logout = async () => {
        if (token) {
            try {
                const response = await import("../api/auth.jsx").then(module => module.logout(token));
                if (response.success) {
                    handleLogout();
                }
            } catch (error) {
                console.error("Logout failed:", error);
                handleLogout();
            }
        } else {
            handleLogout();
        }
    };

    const updateUser = (newUserData) => {
        setUser(newUserData);
        localStorage.setItem("user", JSON.stringify(newUserData));
    };
    
    const value = {
        user,
        token,
        users,
        loading,
        login,
        logout,
        updateUser
    };

    return (
        <UserContext.Provider value={value}>
            {!loading && children}
        </UserContext.Provider>
    );
};
