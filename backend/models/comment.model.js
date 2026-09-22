import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 300,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
            required: true,
        },
    },
    { timestamps: true }
);

commentSchema.index({ post: 1, createdAt: -1 }); // speeds up "get comments for a post, newest first"

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;