import api from './api';

export const getFollowStatus = (username) => api.get(`/follows/${username}/status`);
export const followUser = (username) => api.post(`/follows/${username}/follow`);
export const unfollowUser = (username) => api.delete(`/follows/${username}/follow`);
export const getFollowers = (username) => api.get(`/follows/${username}/followers`);
export const getFollowing = (username) => api.get(`/follows/${username}/following`);