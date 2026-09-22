import api from './api';

export const fetchComments = (postId, page = 1) =>
    api.get(`/comments/post/${postId}?page=${page}`);
export const addComment = (postId, content) =>
    api.post(`/comments/post/${postId}`, { content });
export const deleteComment = (commentId) => api.delete(`/comments/${commentId}`);