/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from 'react';
import './ChatHeader.css';

const ChatHeader = ({ chat, onBack }) => {
    const isGroup = chat?.isGroup;
    const name = isGroup ? chat.groupName : chat.members[0]?.fullName;
    const image = isGroup ? chat.groupPic : chat.members[0]?.profilePicture;
    const onlineStatus = chat.members[0]?.isOnline;

    return (
        <div className="chat-header">
            <button className="back-button" onClick={onBack}>
                <i className="fas fa-arrow-left"></i>
            </button>
            
            <div className="chat-info">
                <img 
                    src={image || '/default-avatar.svg'} 
                    alt={name} 
                    className="chat-pic"
                />
                <div className="chat-details">
                    <h2 className="chat-name">{name}</h2>
                    {!isGroup && (
                        <span className={`status ${onlineStatus ? 'online' : 'offline'}`}>
                            {onlineStatus ? 'Online' : 'Offline'}
                        </span>
                    )}
                    {isGroup && (
                        <span className="participants-count">
                            {chat.members.length} members
                        </span>
                    )}
                </div>
            </div>

            <div className="chat-actions">
                {isGroup && (
                    <button className="action-button" aria-label="Group info">
                        <i className="fas fa-info-circle"></i>
                    </button>
                )}
                <button className="action-button" aria-label="More options">
                    <i className="fas fa-ellipsis-v"></i>
                </button>
            </div>
        </div>
    );
};

export default ChatHeader;
