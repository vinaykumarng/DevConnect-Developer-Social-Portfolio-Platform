import api from './api';

export const fetchUserProfile = (username) => api.get(`/users/${username}`);
export const updateProfile = (data) => api.put('/users/me', data);
export const uploadAvatar = (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/users/me/avatar', formData);
};