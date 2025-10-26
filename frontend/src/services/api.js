import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Unauthorized - redirect to login
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: async (formData) => {
        const response = await api.post('/auth/register', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    login: async (walletAddress, signature, message) => {
        const response = await api.post('/auth/login', {
            walletAddress,
            signature,
            message,
        });
        return response.data;
    },

    logout: async () => {
        const response = await api.post('/auth/logout');
        return response.data;
    },

    getCurrentUser: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },
};

// User API
export const userAPI = {
    getProfile: async () => {
        const response = await api.get('/user/me');
        return response.data;
    },

    getUserById: async (userId) => {
        const response = await api.get(`/user/${userId}`);
        return response.data;
    },

    getUserByWallet: async (walletAddress) => {
        const response = await api.get(`/user/wallet/${walletAddress}`);
        return response.data;
    },

    updateProfile: async (formData) => {
        const response = await api.put('/user/update', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    followUser: async (userId) => {
        const response = await api.post(`/user/follow/${userId}`);
        return response.data;
    },

    getFollowers: async (userId) => {
        const response = await api.get(`/user/followers/${userId}`);
        return response.data;
    },

    searchUsers: async (query) => {
        const response = await api.get(`/user/search?search=${query}`);
        return response.data;
    },

    getRecommended: async () => {
        const response = await api.get('/user/recommended');
        return response.data;
    },

    deleteAccount: async () => {
        const response = await api.delete('/user/delete');
        return response.data;
    },
};

// Post API
export const postAPI = {
    createPost: async (formData) => {
        const response = await api.post('/post/new', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    getAllPosts: async () => {
        const response = await api.get('/post/all');
        return response.data;
    },

    getPostById: async (postId) => {
        const response = await api.get(`/post/${postId}`);
        return response.data;
    },

    deletePost: async (postId) => {
        const response = await api.delete(`/post/${postId}`);
        return response.data;
    },

    likePost: async (postId) => {
        const response = await api.post(`/post/like/${postId}`);
        return response.data;
    },

    commentOnPost: async (postId, comment) => {
        const response = await api.post(`/post/comment/${postId}`, { comment });
        return response.data;
    },

    deleteComment: async (postId, commentId) => {
        const response = await api.delete(`/post/comment/${postId}`, {
            data: { commentId },
        });
        return response.data;
    },
};

// Message API
export const messageAPI = {
    sendMessage: async (receiverId, message) => {
        const response = await api.post('/message/send', {
            receiverId,
            message,
        });
        return response.data;
    },

    getMessages: async (userId) => {
        const response = await api.get(`/message/${userId}`);
        return response.data;
    },

    getAllChats: async () => {
        const response = await api.get('/message/chats');
        return response.data;
    },

    deleteMessage: async (messageId) => {
        const response = await api.delete(`/message/${messageId}`);
        return response.data;
    },

    markAsRead: async (chatId) => {
        const response = await api.put(`/message/read/${chatId}`);
        return response.data;
    },
};

// System API
export const systemAPI = {
    getStatus: async () => {
        const response = await api.get('/status');
        return response.data;
    },
};

export default api;
