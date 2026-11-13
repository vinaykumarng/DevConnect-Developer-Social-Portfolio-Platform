import api from './api';

export const fetchFeed = (page = 1, followingOnly = false) =>
    api.get('/posts', { params: { page, ...(followingOnly && { following: 'true' }) } });
export const fetchUserPosts = (username, page = 1) =>
    api.get(`/posts/user/${username}`, { params: { page } });
export const createPost = (formData) => api.post('/posts', formData);
export const updatePost = (id, data) => api.put(`/posts/${id}`, data);
export const deletePost = (id) => api.delete(`/posts/${id}`);
