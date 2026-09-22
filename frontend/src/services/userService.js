import api from './api';

export const fetchUserProfile = (username) => api.get(`/users/${username}`);
export const updateProfile = (data) => api.put('/users/me', data);