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

 
    useEffect(() => {
        if (user) {
            localStorage.setItem("user", JSON.stringify(user));
        }
    }, [user]);

    useEffect(() => {
        const validateAuth = async () => {
            
            const loggedIn = isUserLoggedIn();
            const storedUser = localStorage.getItem("user");
            
            if (loggedIn && storedUser && storedUser !== "undefined") {
                try {
                    
                    setUser(JSON.parse(storedUser));
                    const storedToken = getStoredToken();
                    if (storedToken) {
                        setToken(storedToken);
                        setAuthToken(storedToken); 
                    }
                } catch (error) {
                    console.error("Error parsing user from localStorage:", error);
                    // Clear the invalid data
                    localStorage.removeItem("user");
                }
                
               
                setLoading(false);
            }
            
            
            try {
                console.log('Validating authentication with server...');
                const response = await getCurrentUser();
                
                if (response.success && response.data && response.data.user) {
                    console.log('Authentication validated successfully');
               
                    const userData = response.data.user;
                    
                    
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
                   
                    if (!loggedIn) {
                        console.log("Authentication failed: Unauthorized");
                        handleLogout();
                    }
                }
            } catch (error) {
                console.error("Server validation failed:", error);
                
                if (!loggedIn && !storedUser) {
                    console.log("No stored credentials, redirecting to login");
                    handleLogout();
                } else {
                    console.log("Using stored credentials due to server error");
                }
            } finally {
           
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
       
        if (userData) {
            setUser(userData);
            
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
