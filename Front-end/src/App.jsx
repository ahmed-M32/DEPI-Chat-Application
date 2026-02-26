import React, { Suspense, lazy } from "react";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import { UserProvider } from "./context/user-context.jsx";
import { ThemeProvider } from "./hooks/useTheme.jsx";
import { SocketProvider } from "./context/socket-context.jsx";
import ChatLayout from "./components/Layout/ChatLayout.jsx";
import ErrorBoundary from "./components/common/ErrorBoundary.jsx";
import "./styles/theme.css";

const HomePage = lazy(() => import("./pages/homepage.jsx"));
const Login = lazy(() => import("./pages/login.jsx"));
const Signup = lazy(() => import("./pages/signup.jsx"));
const Chats = lazy(() => import("./pages/chat-menu.jsx"));
const ProfilePictureUpload = lazy(() => import("./components/ProfilePictureUpload.jsx"));

function App() {
    return (
        <ThemeProvider>
            <BrowserRouter>
                <UserProvider>
                    <SocketProvider>
                        <ErrorBoundary>
                            <Suspense
                                fallback={
                                    <div className="loading-screen">
                                        <i className="fas fa-spinner fa-spin"></i>
                                        <span>Loading...</span>
                                    </div>
                                }
                            >
                                <Routes>
                                    <Route path="/" element={<Signup />} />
                                    <Route
                                        path="/chats"
                                        element={
                                            <ChatLayout>
                                                <Chats />
                                            </ChatLayout>
                                        }
                                    />
                                    <Route path="/login" element={<Login />} />
                                    <Route
                                        path="/users"
                                        element={
                                            <ChatLayout>
                                                <HomePage />
                                            </ChatLayout>
                                        }
                                    />
                                    <Route path="/profile-picture" element={<ProfilePictureUpload />} />
                                </Routes>
                            </Suspense>
                        </ErrorBoundary>
                    </SocketProvider>
                </UserProvider>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;
