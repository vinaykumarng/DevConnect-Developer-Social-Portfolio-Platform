import { useState } from 'react';

export default function CreatePostForm({ onPostCreated }) {
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        setError('');
        setIsSubmitting(true);
        try {
            await onPostCreated({ content, imageUrl });
            setContent('');
            setImageUrl('');
        } catch (err) {
            setError(err.response?.data?.message || 'Could not create post');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-lg p-5 mb-6">
            {error && <p className="text-sm text-red-400 mb-3">{error}</p>}

            <textarea
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={1000}
                placeholder="What are you building?"
                className="w-full bg-gray-800 text-white text-sm rounded-md px-3 py-2 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            />

            <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Image URL (optional — uploads coming later)"
                className="w-full bg-gray-800 text-white text-sm rounded-md px-3 py-2 border border-gray-700 mt-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />

            <div className="flex justify-end mt-3">
                <button
                    type="submit"
                    disabled={isSubmitting || !content.trim()}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2 rounded-md transition-colors"
                >
                    {isSubmitting ? 'Posting...' : 'Post'}
                </button>
            </div>
        </form>
    );
}