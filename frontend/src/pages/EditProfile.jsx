import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateProfile, uploadAvatar } from '../services/userService';
import Avatar from '../components/Avatar';

const inputClass =
    'w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm placeholder:text-muted/70 focus:border-link focus:outline-none';

export default function EditProfile() {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();

    const [bio, setBio] = useState(user?.bio || '');
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
            if (avatarFile) await uploadAvatar(avatarFile);
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
        <div className="px-4 py-6 sm:px-6">
            <h1 className="mb-6 text-xl font-bold">Edit profile</h1>

            {error && (
                <p role="alert" className="mb-4 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
                    {error}
                </p>
            )}

            <form onSubmit={handleSubmit} className="max-w-md space-y-5">
                <div>
                    <span className="mb-2 block text-sm font-semibold">Avatar</span>
                    <div className="flex items-center gap-4">
                        <Avatar user={{ username: user?.username, avatarUrl: avatarPreview }} className="size-16 text-xl" />
                        <label className="cursor-pointer rounded-full border border-line px-4 py-2 text-sm font-semibold hover:bg-blush/60">
                            Change photo
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                onChange={handleAvatarChange}
                                className="sr-only"
                            />
                        </label>
                    </div>
                </div>

                <div>
                    <label htmlFor="bio" className="mb-1 block text-sm font-semibold">
                        Bio
                    </label>
                    <textarea
                        id="bio"
                        rows={3}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        maxLength={200}
                        className={`${inputClass} resize-none`}
                        placeholder="Tell people about yourself..."
                    />
                    <p className="mt-1 text-right text-xs text-muted">{bio.length}/200</p>
                </div>

                <div>
                    <label htmlFor="github" className="mb-1 block text-sm font-semibold">
                        GitHub username
                    </label>
                    <input
                        id="github"
                        type="text"
                        value={githubUsername}
                        onChange={(e) => setGithubUsername(e.target.value)}
                        className={inputClass}
                        placeholder="octocat"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-full bg-plum px-6 py-2 text-sm font-semibold text-white hover:bg-plum-soft disabled:opacity-60"
                    >
                        {isSubmitting ? 'Saving...' : 'Save changes'}
                    </button>
                    <Link to={`/profile/${user?.username}`} className="text-sm text-muted hover:underline">
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
