/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import "./Message.css";

const Message = ({ message, isOwnMessage, sender }) => {
	const [showImageLightbox, setShowImageLightbox] = useState(false);
	const formattedTime =
		message.time ||
		new Date(message.timestamp).toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
		});

	// Check if the message contains an image
	const isImageMessage =
		message.image ||
		(typeof message.content === "string" && message.content === "Image");

	const handleImageClick = () => {
		setShowImageLightbox(true);
	};

	const closeLightbox = () => {
		setShowImageLightbox(false);
	};

	return (
		<div
			className={`message ${isOwnMessage ? "message-own" : "message-other"}`}>
			{!isOwnMessage && (
				<img
					src={sender?.profilePicture || "/default-avatar.svg"}
					alt={sender?.fullName}
					className="message-avatar"
				/>
			)}
			<div className="message-content">
				{!isOwnMessage && (
					<span className="message-sender">{sender?.fullName}</span>
				)}
				<div className="message-bubble">
					{
						/*isImageMessage ? (
                        <div className="message-image-container">
                            <img 
                                src={message.image} 
                                alt="Shared image" 
                                className="message-image"
                                onClick={handleImageClick}
                            />
                        </div>
                    ) : (
                        <p className="message-text">{message.content}</p>
                    )*/
						isImageMessage ? (
							<div className="message-image-container">
								<img
									src={message.image}
									alt="Shared image"
									className="message-image"
									onClick={handleImageClick}
								/>
							</div>
						) : (
							<></>
						)
					}
                    {
                        <p className="message-text">{message.content}</p>
                    }

					<span className="message-time">{formattedTime}</span>
				</div>
			</div>

			{/* Image lightbox */}
			{showImageLightbox && (
				<div className="attachment-lightbox" onClick={closeLightbox}>
					<button className="close-button" onClick={closeLightbox}>
						<i className="fas fa-times"></i>
					</button>
					<img src={message.image} alt="Shared image" />
				</div>
			)}
		</div>
	);
};

export default Message;
