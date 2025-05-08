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
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="loading-screen">
                <i className="fas fa-spinner fa-spin"></i>
                <span>Loading...</span>
            </div>
        );
    }

   /* if (!user && !loading) {
        return <Navigate to="/login" />;
    }*/

    const handleChatSelect = (chat) => {
        setSelectedChat(chat);
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className={`chat-layout ${sidebarOpen ? 'sidebar-open' : ''}`}>
            <div className="sidebar-overlay" onClick={toggleSidebar}></div>
            <Sidebar onChatSelect={(chat) => {
                handleChatSelect(chat);
                // Keep sidebar open after selecting a chat
                // Don't close it automatically
            }} selectedChat={selectedChat} />
            <main className="chat-main">
                <div className="chat-header">
                    <button 
                        className="sidebar-toggle" 
                        onClick={toggleSidebar}
                        title="Toggle Sidebar"
                    >
                        <i className="fas fa-bars"></i>
                    </button>
                    <div className="header-right">
                        <ThemeToggle />
                        <button 
                            className="settings-button" 
                            onClick={() => navigate('/profile-picture')} 
                            title="Profile Settings"
                        >
                            <i className="fas fa-cog"></i>
                        </button>
                    </div>
                </div>
                <div className="chat-content">
                    {React.cloneElement(children, { selectedChat,toggleSidebar })}
                </div>
            </main>
        </div>
    );
};

export default ChatLayout;
