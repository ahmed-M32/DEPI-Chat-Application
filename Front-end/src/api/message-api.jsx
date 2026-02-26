/* eslint-disable no-unused-vars */
import axiosInstance from './axiosConfig';


const API_URL = "http://localhost:5000/api";

const axiosConfig = {
    withCredentials: true
};

export const getMessages = async (conversationId) => {
    try {
        const response = await axiosInstance.get(`/message/${conversationId}`, axiosConfig);
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            code: error.response?.status || 500,
            message: error.response?.data?.message || "Failed to get messages"
        };
    }
};

export const getUsers = async () => {
    try {
        const response = await axiosInstance.get('/message/users', axiosConfig);
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            code: error.response?.status || 500,
            message: error.response?.data?.message || "Failed to get users"
        };
    }
};

export const getChats = async () => {
    try {
        const response = await axiosInstance.get('/message/chats', axiosConfig);
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            code: error.response?.status || 500,
            message: error.response?.data?.message || "Failed to get chats"
        };
    }
};

export const markChatRead = async (chatId) => {
    try {
        await axiosInstance.post(`/message/chat/${chatId}/read`, {}, axiosConfig);
        return { success: true };
    } catch (error) {
        return {
            success: false,
            code: error.response?.status || 500,
            message: error.response?.data?.message || "Failed to mark chat read"
        };
    }
};

export const markGroupRead = async (groupId) => {
    try {
        await axiosInstance.post(`/message/group/${groupId}/read`, {}, axiosConfig);
        return { success: true };
    } catch (error) {
        return {
            success: false,
            code: error.response?.status || 500,
            message: error.response?.data?.message || "Failed to mark group read"
        };
    }
};

export const createNewChat = async (userId) => {
    try {
        const response = await axiosInstance.post('/message/chat', { member: userId }, axiosConfig);
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            code: error.response?.status || 500,
            message: error.response?.data?.message || "Failed to create chat"
        };
    }
};

export const createNewGroup = async (data) => {
    try {
        const response = await axiosInstance.post('/message/group', data, axiosConfig);
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            code: error.response?.status || 500,
            message: error.response?.data?.message || "Failed to create group"
        };
    }
};

export const sendMessage = async (chatId, messageData) => {
    try {
        console.log(messageData)
        const response = await axiosInstance.post(`/message/send/${chatId}`, {
            content: messageData.content,
            image: messageData.image,
            receiver : messageData.receiver,
        }, axiosConfig);
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            code: error.response?.status || 500,
            message: error.response?.data?.message || "Failed to send message"
        };
    }
};

export const sendGroupMessage = async (groupId, messageData) => {
    try {
        const response = await axiosInstance.post(`/message/group/send/${groupId}`, {
            content: messageData.content,
            ...(messageData.image && { image: messageData.image })
        }, axiosConfig);
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            code: error.response?.status || 500,
            message: error.response?.data?.message || "Failed to send group message"
        };
    }
};

export const updateProfilePicture = async (imageUrl) => {
    try {
        const response = await axios.post(`${API_URL}/auth/update-profile-pic`, 
            { imageUrl }, 
            axiosConfig
        );
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            code: error.response?.status || 500,
            message: error.response?.data?.message || "Failed to update profile picture"
        };
    }
};

export const createChat = async (userId) => {
    try {
        const response = await axios.post(`${API_URL}/message/chat`, {
            member: userId,
        }, axiosConfig);
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            code: error.response?.status || 500,
            message: error.response?.data?.message || "Failed to create chat"
        };
    }
};

export const createGroup = async (groupData) => {
    try {
        const response = await axios.post(`${API_URL}/message/group`, {
            groupName: groupData.groupName,
            members: groupData.members,
        }, axiosConfig);
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            code: error.response?.status || 500,
            message: error.response?.data?.message || "Failed to create group"
        };
    }
};
