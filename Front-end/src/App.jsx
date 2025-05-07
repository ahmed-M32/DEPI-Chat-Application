/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import HomePage from "./pages/homepage.jsx";
import Login from "./pages/login.jsx";
import Signup from "./pages/signup.jsx";
import Chats from "./pages/chat-menu.jsx";
import { UserProvider } from "./context/user-context.jsx";
import { ThemeProvider } from "./hooks/useTheme.jsx";
import { SocketProvider } from "./context/socket-context.jsx";
import ChatLayout from "./components/Layout/ChatLayout.jsx";
import ProfilePictureUpload from "./components/ProfilePictureUpload.jsx";
import "./styles/theme.css";

function App() {
	return (
		<ThemeProvider>
			<UserProvider>
				<BrowserRouter>
					<SocketProvider>
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
					</SocketProvider>
				</BrowserRouter>
			</UserProvider>
		</ThemeProvider>
	);
}

export default App;
