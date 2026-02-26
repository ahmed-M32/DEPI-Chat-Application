/* eslint-disable react/jsx-key */
/* eslint-disable no-unused-vars */
import React from "react";
import { useUsersDirectory } from "../context/user-context.jsx";

const HomePage = () => {
	const { users } = useUsersDirectory();
	const list = users?.data || [];

	return (
		<div>
			<div className="users">
				{list.map((user) => {
					return (
						<div className="user" key={user._id}>
							<div className="name">{user.fullName}</div>
							<div className="pic">
								<img
									src={user.profilePicture || "/default-avatar.svg"}
									alt={user.fullName}
									style={{ width: 40, height: 40, borderRadius: "50%" }}
									loading="lazy"
									decoding="async"
								/>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default HomePage;
