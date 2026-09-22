import api from './api';

export const fetchFeed = (page = 1) => api.get(`/posts?page=${page}`);
export const fetchUserPosts = (username, page = 1) =>
    api.get(`/posts/user/${username}?page=${page}`);
export const createPost = (data) => api.post('/posts', data);
export const updatePost = (id, data) => api.put(`/posts/${id}`, data);
export const deletePost = (id) => api.delete(`/posts/${id}`);