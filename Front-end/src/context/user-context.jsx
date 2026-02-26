/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, {
    createContext,
    useState,
    useContext,
    useEffect,
    useCallback,
    useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout as logoutApi } from "../api/auth.jsx";
import { getUsers } from "../api/message-api.jsx";

const AuthContext = createContext();
const UsersDirectoryContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthContext provider");
    }
    return context;
};

export const useUsersDirectory = () => {
    const context = useContext(UsersDirectoryContext);
    if (!context) {
        throw new Error("useUsersDirectory must be used within a UsersDirectoryContext provider");
    }
    return context;
};

export const useUser = () => {
    const auth = useAuth();
    const { users } = useUsersDirectory();
    return { ...auth, users };
};

export const UserProvider = ({ children }) => {
    const navigate = useNavigate();

    // Only user display data in localStorage (non-sensitive, for instant UI load)
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

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Sync user display data to localStorage whenever it changes
    useEffect(() => {
        if (user) {
            localStorage.setItem("user", JSON.stringify(user));
        }
    }, [user]);

    // On mount, validate auth with server via cookie
    useEffect(() => {
        const validateAuth = async () => {
            try {
                console.log("Validating authentication with server...");
                const response = await getCurrentUser(); // cookie is sent automatically
                console.log(response)
                if (response.success && response.data && response.data.user) {
                    console.log("Authentication validated successfully");
                    const userData = response.data.user;
                    if (userData && typeof userData === "object") {
                        setUser(userData);
                        localStorage.setItem("user", JSON.stringify(userData));
                    }
                } else if (response.code === 401) {
                    console.log("Authentication failed: Unauthorized");
                    handleLogout();
                }
            } catch (error) {
                console.error("Server validation failed:", error);
                // If server is down but we have cached user, keep them logged in
                const storedUser = localStorage.getItem("user");
                if (!storedUser) {
                    handleLogout();
                }
            } finally {
                setLoading(false);
            }
        };

        validateAuth();
    }, []);

    // Fetch users list once on mount
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await getUsers();
                if (response.success) {
                    setUsers(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch users:", error);
            }
        };

        fetchUsers();
    }, []);

    const login = useCallback((userData) => {
        if (userData) {
            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
        }
    }, []);

    const handleLogout = useCallback(() => {
        setUser(null);
        setUsers([]);
        localStorage.removeItem("user");
    }, [navigate]);

    const logout = useCallback(async () => {
        try {
            const response = await logoutApi(); // tells server to clear the cookie
            if (response.success) {
                handleLogout();
            }
        } catch (error) {
            console.error("Logout failed:", error);
            handleLogout(); // logout locally anyway
        }
    }, [handleLogout]);

    const updateUser = useCallback((newUserData) => {
        setUser(newUserData);
        localStorage.setItem("user", JSON.stringify(newUserData));
    }, []);

    const authValue = useMemo(
        () => ({
            user,
            loading,
            login,
            logout,
            updateUser,
        }),
        [user, loading, login, logout, updateUser]
    );

    const usersValue = useMemo(
        () => ({
            users,
        }),
        [users]
    );

    return (
        <AuthContext.Provider value={authValue}>
            <UsersDirectoryContext.Provider value={usersValue}>
                {children}
            </UsersDirectoryContext.Provider>
        </AuthContext.Provider>
    );
};
