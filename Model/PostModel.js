const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    caption: {
        type: String
    },
    image: String,
    video: String,
    hubby: String,
    createdAt: {
        type: Date,
        default: Date.now()
    }
})

const PostModel = mongoose.model('Post', postSchema);

module.exports = PostModel;