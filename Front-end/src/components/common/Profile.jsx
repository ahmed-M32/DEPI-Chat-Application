/* eslint-disable react/prop-types */
import React from "react";
import styles from "./Profile.module.css";

/**
 * Compact profile block: avatar, name, optional subtitle, and actions (e.g. logout).
 */
const Profile = ({
	user,
	onProfileClick,
	logoutButtonLabel = "Log out",
	onLogout,
}) => {
	if (!user) return null;

	return (
		<div className={styles.wrapper}>
			<button
				type="button"
				className={styles.profileButton}
				onClick={onProfileClick}
				aria-label="Open profile settings"
			>
				<img
					src={user.profilePicture || "/default-avatar.svg"}
					alt=""
					className={styles.avatar}
					loading="lazy"
					decoding="async"
					width={40}
					height={40}
				/>
				<div className={styles.text}>
					<span className={styles.name}>{user.fullName || "User"}</span>
					{user.email && (
						<span className={styles.subtitle}>{user.email}</span>
					)}
				</div>
			</button>
			<button
				type="button"
				className={styles.logout}
				onClick={onLogout}
				aria-label={logoutButtonLabel}
				title={logoutButtonLabel}
			>
				<i className="fas fa-sign-out-alt" aria-hidden />
			</button>
		</div>
	);
};

export default Profile;
