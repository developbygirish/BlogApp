const mongoose = require('mongoose');
const User = require('./user');
const Blog = require('./blog');

const commentSchema = new mongoose.Schema({
    comment: {
        type: String,
        required: true,
    },
    blogId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Blog
    },   
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User
    }
}, { timestamps: true });

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
