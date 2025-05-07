/* eslint-disable react/jsx-key */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { getUsers } from "../api/message-api.jsx";
import { useUser } from "../context/user-context.jsx";

const HomePage = () => {
	const users = useUser();

	return (
		<div>
			<div className="users">
				{users.map((user) => {
					return (
						<div className="user">
							<div className="name">{user.fullName}</div>
							<div className="pic">{user.profilePicture}</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default HomePage;
