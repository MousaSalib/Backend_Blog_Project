const mongoose = require('mongoose');
const Joi = require('joi');
const JWT = require('jsonwebtoken'); 

const UserSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100,
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 8,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 100,
        unique: true,
    },
    profilePhoto: {
        type: Object,
        default: {
            url: 'https://cdn.pixabay.com/photo/2016/04/01/10/11/avatar-1299805_1280.png',
            publicId: null,
        }
    },
    bio: {
        type: String,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    isAccountVerified: {
        type: Boolean,
        default: false,
    }

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

UserSchema.virtual("posts", {
    ref: 'Post',
    foreignField: 'user',
    localField: '_id'
});

UserSchema.methods.generateAuthToken = function() {
    return JWT.sign({id: this._id, isAdmin: this.isAdmin}, process.env.JWT_SECRET_KEY);
};

function validateRegisterUser (obj) {
    const schema = Joi.object({
        username: Joi.string().trim().min(2).max(100).required(),
        password: Joi.string().trim().min(8).required(),
        email: Joi.string().trim().min(5).max(100).required().email(),
    });
    return schema.validate(obj)
};

function validateLoginUser(obj) {
    const schema = Joi.object({
        email: Joi.string().trim().min(5).max(100).required().email(),
        password: Joi.string().trim().min(8).required(),
    });
    return schema.validate(obj);
};

function validateUpdateUser(obj) {
    const schema = Joi.object({
        username: Joi.string().trim().min(2).max(100),
        password: Joi.string().trim().min(8),
        bio: Joi.string(),
    });
    return schema.validate(obj)
}

const User = mongoose.model('User', UserSchema);
module.exports = {
    User,
    validateRegisterUser,
    validateLoginUser,
    validateUpdateUser,
};