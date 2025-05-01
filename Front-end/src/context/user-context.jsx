/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { createContext, useState, useContext, useEffect } from "react";
import { getUsers } from "../api/message-api";

const UserContext = createContext();

export const useUsers = () => {
	return useContext(UserContext);
};

export const UserProvider = ({ children }) => {
	const [users, setUsers] = useState([]);
	const [currentUser, setCurrentUser] = useState("");

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const data = await getUsers();
				if (data.success) {
					setUsers(data.data);
				}
			} catch (error) {
				console.error("Error fetching users:", error);
			}
		};
		fetchUsers();
	}, []);
	const exports = {
		users, currentUser,setCurrentUser
	}

	return <UserContext.Provider value={exports}>{children}</UserContext.Provider>;
};
