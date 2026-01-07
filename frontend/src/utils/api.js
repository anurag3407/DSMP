// API Configuration
export const API_BASE_URL = 'http://localhost:5001/api';

// Token management
let authToken = null;

export const setAuthToken = (token) => {
    console.log('[DEBUG] API: Setting auth token:', token ? 'present' : 'null');
    authToken = token;
    if (token) {
        localStorage.setItem('dsmp_token', token);
    } else {
        localStorage.removeItem('dsmp_token');
    }
};

export const getAuthToken = () => {
    if (!authToken) {
        authToken = localStorage.getItem('dsmp_token');
    }
    return authToken;
};

// Generic fetch wrapper with auth
const apiFetch = async (endpoint, options = {}) => {
    const token = getAuthToken();
    const url = `${API_BASE_URL}${endpoint}`;

    console.log('[DEBUG] API Request:', options.method || 'GET', url);

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });

        const data = await response.json();
        console.log('[DEBUG] API Response:', response.status, endpoint);

        if (!response.ok) {
            console.error('[DEBUG] API Error:', data.error);
            throw new Error(data.error || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('[DEBUG] API Fetch Error:', endpoint, error.message);
        throw error;
    }
};

// Auth API
export const getNonce = async (walletAddress) => {
    console.log('[DEBUG] API: getNonce for', walletAddress);
    return apiFetch(`/auth/nonce/${walletAddress}`);
};

export const login = async (walletAddress, signature) => {
    console.log('[DEBUG] API: login for', walletAddress);
    const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ walletAddress, signature }),
    });

    if (data.token) {
        setAuthToken(data.token);
    }

    return data;
};

export const verifyToken = async () => {
    console.log('[DEBUG] API: verifyToken');
    try {
        const data = await apiFetch('/auth/verify');
        return data;
    } catch (error) {
        setAuthToken(null);
        return { valid: false };
    }
};

export const logout = () => {
    console.log('[DEBUG] API: logout');
    setAuthToken(null);
};

// User API
export const getUser = async (walletAddress) => {
    console.log('[DEBUG] API: getUser', walletAddress);
    return apiFetch(`/users/${walletAddress}`);
};

export const updateUser = async (userData) => {
    console.log('[DEBUG] API: updateUser');
    return apiFetch('/users', {
        method: 'PUT',
        body: JSON.stringify(userData),
    });
};

export const searchUsers = async (query) => {
    console.log('[DEBUG] API: searchUsers', query);
    return apiFetch(`/users/search/${query}`);
};

// Post API
export const createPostAPI = async (content, onChainData = {}) => {
    console.log('[DEBUG] API: createPost');
    return apiFetch('/posts', {
        method: 'POST',
        body: JSON.stringify({
            content,
            ...onChainData,
        }),
    });
};

export const getPostAPI = async (postId) => {
    console.log('[DEBUG] API: getPost', postId);
    return apiFetch(`/posts/${postId}`);
};

export const updatePostAPI = async (postId, content) => {
    console.log('[DEBUG] API: updatePost', postId);
    return apiFetch(`/posts/${postId}`, {
        method: 'PUT',
        body: JSON.stringify({ content }),
    });
};

export const deletePostAPI = async (postId) => {
    console.log('[DEBUG] API: deletePost', postId);
    return apiFetch(`/posts/${postId}`, {
        method: 'DELETE',
    });
};

export const getUserPosts = async (walletAddress, page = 1, limit = 20) => {
    console.log('[DEBUG] API: getUserPosts', walletAddress);
    return apiFetch(`/posts/user/${walletAddress}?page=${page}&limit=${limit}`);
};

export const getAllPosts = async (page = 1, limit = 20) => {
    console.log('[DEBUG] API: getAllPosts');
    return apiFetch(`/posts?page=${page}&limit=${limit}`);
};

// Comment API
export const getComments = async (postId, page = 1, limit = 20) => {
    console.log('[DEBUG] API: getComments', postId);
    return apiFetch(`/comments/post/${postId}?page=${page}&limit=${limit}`);
};

export const addComment = async (postId, content) => {
    console.log('[DEBUG] API: addComment', postId);
    return apiFetch(`/comments/post/${postId}`, {
        method: 'POST',
        body: JSON.stringify({ content }),
    });
};

export const deleteComment = async (commentId) => {
    console.log('[DEBUG] API: deleteComment', commentId);
    return apiFetch(`/comments/${commentId}`, {
        method: 'DELETE',
    });
};

// Like API
export const likePostAPI = async (postId) => {
    console.log('[DEBUG] API: likePost', postId);
    return apiFetch(`/likes/${postId}`, {
        method: 'POST',
    });
};

export const unlikePostAPI = async (postId) => {
    console.log('[DEBUG] API: unlikePost', postId);
    return apiFetch(`/likes/${postId}`, {
        method: 'DELETE',
    });
};

export const checkLiked = async (postId) => {
    console.log('[DEBUG] API: checkLiked', postId);
    return apiFetch(`/likes/check/${postId}`);
};

export const getPostLikes = async (postId) => {
    console.log('[DEBUG] API: getPostLikes', postId);
    return apiFetch(`/likes/post/${postId}`);
};

// Feed API
export const getFeedAPI = async (page = 1, limit = 20) => {
    console.log('[DEBUG] API: getFeed');
    return apiFetch(`/feed?page=${page}&limit=${limit}`);
};

export const getExploreFeed = async (page = 1, limit = 20) => {
    console.log('[DEBUG] API: getExploreFeed');
    return apiFetch(`/feed/explore?page=${page}&limit=${limit}`);
};
