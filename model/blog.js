const mongoose = require('mongoose');
const User = require('./user');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  image: {
    type: String,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User
  },
  views: [{
    timestamps: Number,
  }]
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
