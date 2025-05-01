/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import HomePage from "./pages/homepage.jsx";
import Login from "./pages/login.jsx";
import Signup from "./pages/signup.jsx";
import Chats from "./pages/chat-menu.jsx";
import { UserProvider } from "./context/user-context.jsx";

function App() {
	return (
		<UserProvider>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Signup />} />
					<Route path="/chats" element={<Chats />} />
					<Route path="/login" element={<Login />}></Route>
					<Route path="/users" element={<HomePage />}></Route>
				</Routes>
			</BrowserRouter>
		</UserProvider>
	);
}

export default App;
