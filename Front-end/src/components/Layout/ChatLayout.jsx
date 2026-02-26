/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/user-context";
import Sidebar from "./Sidebar";
import ThemeToggle from "./ThemeToggle";
import styles from "./ChatLayout.module.css";

const ChatLayout = ({ children }) => {
	const { user, loading } = useAuth();
	const [selectedChat, setSelectedChat] = useState(null);
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const navigate = useNavigate();

	const handleChatSelect = (chat) => {
		setSelectedChat(chat);
		setSidebarOpen(false);
	};

	const toggleSidebar = () => setSidebarOpen((o) => !o);
	const closeSidebar = () => setSidebarOpen(false);

	if (loading) {
		return (
			<div className={styles.loadingScreen} role="status" aria-live="polite">
				<div data-spinner aria-hidden />
				<span>Loading…</span>
			</div>
		);
	}

	return (
		<div className={styles.layout}>
			<div
				className={`${styles.overlay} ${sidebarOpen ? styles.visible : ""}`}
				onClick={closeSidebar}
				onKeyDown={(e) => e.key === "Escape" && closeSidebar()}
				aria-hidden={!sidebarOpen}
				tabIndex={-1}
			/>
			<Sidebar
				onChatSelect={handleChatSelect}
				selectedChat={selectedChat}
				isOpen={sidebarOpen}
				onClose={closeSidebar}
			/>
			<main className={styles.main} id="main-content">
				<header className={styles.topBar}>
					<button
						type="button"
						className={styles.sidebarToggle}
						onClick={toggleSidebar}
						aria-label="Open menu"
						aria-expanded={sidebarOpen}
					>
						<i className="fas fa-bars" aria-hidden />
					</button>
					<div className={styles.topBarRight}>
						<ThemeToggle />
						<button
							type="button"
							className={styles.iconBtn}
							onClick={() => navigate("/profile-picture")}
							aria-label="Profile settings"
							title="Profile settings"
						>
							<i className="fas fa-cog" aria-hidden />
						</button>
					</div>
				</header>
				<div className={styles.content}>
					<div className={styles.contentInner}>
						{React.cloneElement(children, {
							selectedChat,
							toggleSidebar,
						})}
					</div>
				</div>
			</main>
		</div>
	);
};

export default ChatLayout;
