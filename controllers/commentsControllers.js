const asyncHandler = require('express-async-handler');
const httpStatusText = require('../utils/httpStatusText');
const { validateCreateComment, Comment, validateUpdateComment } = require('../models/Comment');
const { User } = require('../models/User');

/**
 * @Create_Comment
 * @POST
*/
module.exports.createCommentCtrl = asyncHandler(async (req, res) => {
    const { error } = validateCreateComment(req.body);
    if(error) {
        return res.status(400).json({ status: httpStatusText.FAIL, message: error.details[0].message});
    }
    const profile = await User.findById(req.user.id);
    const comment = await Comment.create({
        postId: req.body.postId,
        text: req.body.text,
        user: req.user.id,
        username: profile.username,
    });
    res.status(201).json({ status: httpStatusText.SUCCESS, newComment: comment });
});

/**
 * @Get_All_Comments
 * @GET
*/
module.exports.getAllCommentsCtrl = asyncHandler(async (req, res) => {
    const comments = await Comment.find();
    res.status(200).json({ status: httpStatusText.SUCCESS, comments: comments });
});

/**
 * @Delete_Comment
 * @DELETE
*/
module.exports.deleteCommentCtrl = asyncHandler(async (req, res) => {
    const comment = await Comment.findById(req.params.id);
    if(!comment) {
        return res.status(404).json({ status: httpStatusText.FAIL, message: "The comment is not exist"});
    }
    if(req.user.isAdmin || req.user.id === req.user.toString()) {
        await Comment.findByIdAndDelete(req.params.id);
        res.status(200).json({ status: httpStatusText.SUCCESS, message: "The comment has been deleted successfully"});
    }else {
        return res.status(403).json({ status: httpStatusText.FAIL, message: "Access denied, You are not allowed"});
    }
});

/**
 * @Update_Comment
 * @PUT
*/
module.exports.updateCommentCtrl = asyncHandler(async (req, res) => {
    const { error } = validateUpdateComment(req.body);
    const comment = await Comment.findById(req.params.id);
    if(error) {
        return res.status(400).json({ status: httpStatusText.FAIL, message: error.details[0].message})
    }
    if(!comment) {
        return res.status(404).json({ status: httpStatusText.FAIL, message: "The comment is not exist"});
    }
    if(req.user.id !== comment.user.toString()) {
        return res.status(403).json({ status: httpStatusText.FAIL, message: "access denied, Not allowed" });
    }else {
        const updatedComment = await Comment.findByIdAndUpdate(req.params.id, {
            $set: {
                text: req.body.text,
            }
        }, { new: true });
        res.status(200).json({ status: httpStatusText.SUCCESS, updatedComment: updatedComment});
    }
});