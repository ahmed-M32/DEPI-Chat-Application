/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/user-context';
import Sidebar from './Sidebar';
import ThemeToggle from './ThemeToggle';
import './ChatLayout.css';

const ChatLayout = ({ children }) => {
    const { user, loading } = useUser();
    const [selectedChat, setSelectedChat] = useState(null);
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="loading-screen">
                <i className="fas fa-spinner fa-spin"></i>
                <span>Loading...</span>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    const handleChatSelect = (chat) => {
        setSelectedChat(chat);
    };

    return (
        <div className="chat-layout">
            <Sidebar onChatSelect={handleChatSelect} selectedChat={selectedChat} />
            <main className="chat-main">
                <div className="chat-header">
                    <ThemeToggle />
                    <button 
                        className="settings-button" 
                        onClick={() => navigate('/profile-picture')} 
                        title="Profile Settings"
                    >
                        <i className="fas fa-cog"></i>
                    </button>
                </div>
                <div className="chat-content">
                    {React.cloneElement(children, { selectedChat })}
                </div>
            </main>
        </div>
    );
};

export default ChatLayout;
