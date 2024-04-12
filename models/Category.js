const mongoose = require('mongoose');
const Joi = require("joi");

const CategorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
    }
}, { timestamps: true });

const Category = mongoose.model('Category', CategorySchema);
function validateCreateCategory(obj) {
    const schema = Joi.object({
        title: Joi.string().trim().required().label("Title"),
    });
    return schema.validate(obj);
};

module.exports = {
    Category,
    validateCreateCategory,
}