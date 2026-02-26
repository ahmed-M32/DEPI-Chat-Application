/* eslint-disable react/prop-types */
import React, { useState } from "react";
import styles from "./Message.module.css";

const Message = ({ message, isOwnMessage, sender }) => {
	const [showLightbox, setShowLightbox] = useState(false);
	const formattedTime =
		message.time ||
		(message.createdAt &&
			new Date(message.createdAt).toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
			})) ||
		"";

	const hasImage = message.image || message.content === "Image";

	return (
		<div
			className={`${styles.root} ${isOwnMessage ? styles.own : ""}`}
			role="listitem"
		>
			{!isOwnMessage && sender && (
				<img
					src={sender.profilePicture || "/default-avatar.svg"}
					alt=""
					className={styles.avatar}
					loading="lazy"
					decoding="async"
					width={28}
					height={28}
				/>
			)}
			<div className={styles.bubbleWrap}>
				{!isOwnMessage && sender && (
					<span className={styles.senderName}>{sender.fullName}</span>
				)}
				<div className={styles.bubble}>
					{hasImage && message.image && (
						<div className={styles.imageWrap}>
							<img
								src={message.image}
								alt="Shared content"
								loading="lazy"
								decoding="async"
								onClick={() => setShowLightbox(true)}
							/>
						</div>
					)}
					{message.content &&
						message.content !== "Image" && (
							<p className={styles.text}>{message.content}</p>
						)}
					<div className={styles.meta}>
						<span className={styles.time}>{formattedTime}</span>
						{isOwnMessage && (
							<span
								className={styles.statusIcon}
								title="Sent"
								aria-label="Sent"
							>
								<i className="fas fa-check" aria-hidden />
							</span>
						)}
					</div>
				</div>
			</div>

			{showLightbox && message.image && (
				<div
					className={styles.lightbox}
					onClick={() => setShowLightbox(false)}
					role="dialog"
					aria-modal="true"
					aria-label="Image preview"
				>
					<button
						type="button"
						className={styles.lightboxClose}
						onClick={() => setShowLightbox(false)}
						aria-label="Close preview"
					>
						<i className="fas fa-times" aria-hidden />
					</button>
					<img
						src={message.image}
						alt="Full size"
						onClick={(e) => e.stopPropagation()}
					/>
				</div>
			)}
		</div>
	);
};

export default Message;
