import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/userService';
import {uploadAvatar} from "../services/userService";

export default function EditProfile() {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();

    const [bio, setBio] = useState(user?.bio || '');
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
    const [githubUsername, setGithubUsername] = useState(user?.githubUsername || '');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || '');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            if (avatarFile) {
                await uploadAvatar(avatarFile);
            }
            await updateProfile({ bio, githubUsername });
            await refreshUser();
            navigate(`/profile/${user.username}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Could not update profile');
        } finally {
            setIsSubmitting(false);
        }
    };
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file)); // local preview before upload
    };

    return (
        <div className="max-w-lg mx-auto px-4 py-10">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
                <h1 className="text-xl font-bold text-white mb-6">Edit Profile</h1>

                {error && (
                    <div className="mb-4 text-sm text-red-400 bg-red-950/50 border border-red-900 rounded-md px-3 py-2">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Bio</label>
                        <textarea
                            rows={3}
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            maxLength={200}
                            className="w-full bg-gray-800 text-white text-sm rounded-md px-3 py-2 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                            placeholder="Tell people about yourself..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Avatar</label>
                        <div className="flex items-center gap-4">
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Preview" className="w-16 h-16 rounded-full object-cover border border-gray-700" />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-gray-800 border border-gray-700" />
                            )}
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                onChange={handleAvatarChange}
                                className="text-sm text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-gray-800 file:text-gray-300 file:text-sm hover:file:bg-gray-700 file:cursor-pointer cursor-pointer"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">GitHub Username</label>
                        <input
                            type="text"
                            value={githubUsername}
                            onChange={(e) => setGithubUsername(e.target.value)}
                            className="w-full bg-gray-800 text-white text-sm rounded-md px-3 py-2 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="octocat"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-md transition-colors"
                    >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
}