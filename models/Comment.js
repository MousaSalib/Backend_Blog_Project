const mongoose = require('mongoose');
const Joi = require('joi');

const CommentSchema = new mongoose.Schema({
    postId : {
        type: mongoose.Types.ObjectId,
        ref: "Post",
        required: true,
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    }
}, { timestamps: true });

function validateCreateComment(obj) {
    const schema = Joi.object({
        postId: Joi.string().required().label("Post ID"),
        text: Joi.string().trim().required().label("Text"),
    });
    return schema.validate(obj);
}

function validateUpdateComment(obj) {
    const schema = Joi.object({
        text: Joi.string().trim()
    });
    return schema.validate(obj);
}

const Comment = mongoose.model("Comment", CommentSchema);

module.exports = {
    Comment,
    validateCreateComment,
    validateUpdateComment,
}