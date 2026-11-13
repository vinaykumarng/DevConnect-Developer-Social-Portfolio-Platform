import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import Icon from './Icons';

const MAX = 1000;

// "What's happening?" composer. Only attaching an image is wired up today.
export default function CreatePostForm({ onPostCreated }) {
    const { user } = useAuth();
    const [content, setContent] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const clearImage = () => {
        setImageFile(null);
        setImagePreview('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        setError('');
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('content', content);
            if (imageFile) formData.append('image', imageFile);

            await onPostCreated(formData);
            setContent('');
            clearImage();
        } catch (err) {
            setError(err.response?.data?.message || 'Could not create post');
        } finally {
            setIsSubmitting(false);
        }
    };

    const canPost = !isSubmitting && content.trim().length > 0;

    return (
        <form onSubmit={handleSubmit} className="flex gap-3 border-b border-line px-4 pb-3 pt-4">
            <Avatar user={user} />
            <div className="min-w-0 flex-1">
                <textarea
                    id="composer"
                    rows={2}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    maxLength={MAX}
                    placeholder="What's happening?"
                    aria-label="Write a post"
                    className="w-full resize-none bg-transparent pt-1.5 text-xl placeholder:text-muted/70 focus:outline-none"
                />

                {imagePreview && (
                    <div className="relative mt-2 inline-block">
                        <img src={imagePreview} alt="Preview" className="max-h-64 rounded-2xl border border-line object-cover" />
                        <button
                            type="button"
                            onClick={clearImage}
                            aria-label="Remove image"
                            className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-plum/80 text-white hover:bg-plum"
                        >
                            <Icon name="close" className="size-4" />
                        </button>
                    </div>
                )}

                {error && <p className="mt-2 text-sm text-danger">{error}</p>}

                <div className="mt-2 flex items-center justify-between">
                    <label className="grid size-9 cursor-pointer place-items-center rounded-full text-coral transition-colors hover:bg-tint/60" title="Add image">
                        <Icon name="image" className="size-5" />
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={handleImageChange}
                            className="sr-only"
                        />
                    </label>

                    <div className="flex items-center gap-3">
                        {content.length > MAX - 100 && (
                            <span className="text-xs text-muted">{MAX - content.length}</span>
                        )}
                        <button
                            type="submit"
                            disabled={!canPost}
                            className={`rounded-full px-6 py-2 text-sm font-semibold transition-colors ${
                                canPost ? 'bg-plum text-white hover:bg-plum-soft' : 'cursor-not-allowed bg-blush text-muted'
                            }`}
                        >
                            {isSubmitting ? 'Posting...' : 'Post'}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
}
