const asyncHandler = require('express-async-handler');
const httpStatusText = require('../utils/httpStatusText');
const path = require("path");
const fs = require('fs');
const { validateCreatePost, Post, validateUpdatePost } = require('../models/Post');
const { cloudinaryUploadImage, cloudinaryRemoveImage } = require('../utils/cloudinary');
const { Comment } = require('../models/Comment');

/**
 * @Create_Post
 * @POST
*/
module.exports.createPostCtrl = asyncHandler(async (req, res) => {
    if(!req.file) {
        return res.status(400).json({ status: httpStatusText.FAIL, message: "No image provided"});
    }
    const { error } = validateCreatePost(req.body);
    if(error) {
        return res.status(400).json({ status: httpStatusText.FAIL, message: error.details[0].message});
    }else {
        const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
        const result = await cloudinaryUploadImage(imagePath);
        const post = await Post.create({
            title: req.body.title,
            description: req.body.description,
            category: req.body.category,
            user: req.user.id,
            image: {
                url: result.secure_url,
                publicId: result.public_id,
            }

        });
        res.status(201).json({ status: httpStatusText.SUCCESS, message: post });
        fs.unlinkSync(imagePath);
    }
});

/**
 * @Get_Posts
 * @GET
*/
module.exports.getAllPostsCtrl = asyncHandler( async (req, res) => {
    const PAGE_PER_POST = 3;
    const { pageNumber, category } = req.query;
    let posts;

    if(pageNumber) {
        posts = await Post.find().skip((pageNumber -1) * PAGE_PER_POST).limit(PAGE_PER_POST).sort({ createdAt: -1 }).populate("user", ['-password']);
    }else if(category) {
        posts = await Post.find({ category }).sort({ createdAt: -1 }).populate('user', ['-password']);
    }else {
        posts = await Post.find().sort({ createdAt: -1 }).populate('user', ["-password"]);
    }
    res.status(200).json({ status: httpStatusText.SUCCESS, posts: posts });
});

/**
 * @Get_Single_Post
 * @GET
*/
module.exports.getSinglePostCtrl = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id).populate('user', ['-password']).populate('comments');
    if(!post) {
        return res.status(404).json({ status: httpStatusText.FAIL, message: "Post is not found" });
    }else {
        res.status(200).json({status: httpStatusText.SUCCESS, post: post});
    }
});

/**
 * @Get_The_Number_Of_Posts
 * @GET
*/
module.exports.getPostsCountCtrl = asyncHandler( async (req, res) => {
    const count = await Post.countDocuments();
    res.status(200).json({ status: httpStatusText.SUCCESS, count });
});

/**
 * @Delete_Post
 * @DELETE
*/
module.exports.deletePostCtrl = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);
    if(!post) {
        return res.status(404).json({status: httpStatusText.FAIL, message: "Post is not found"});
    }
    if(req.user.isAdmin || req.user.id === post.user.toString()) {
        await Post.findByIdAndDelete(req.params.id);
        await cloudinaryRemoveImage(post.image.publicId);
        await Comment.deleteMany({ postId: post._id });
        res.status(200).json({status: httpStatusText.SUCCESS, message: "The post has been deleted successfully", postId: post._id});
    }else {
        return res.status(403).json({status: httpStatusText.FAIL, message: "Access denied, forbidden"});
    }
});

/**
 * @Update_Post
 * @PUT
*/
module.exports.updatePostCtrl = asyncHandler(async (req, res) => {
    const { error } = validateUpdatePost(req.body);
    if(error) {
        return res.status(400).json({status: httpStatusText.FAIL, message: error.details[0].message})
    }
    const post = await Post.findById(req.params.id);
    if(!post) {
        return res.status(404).json({status: httpStatusText.FAIL, message: "The post is not found"});
    }else if(req.user.id !== post.user.toString()) {
        return res.status(403).json({status: httpStatusText.FAIL, message: "Access denied, Not allowed"})
    }else {
        const updatedPost = await Post.findByIdAndUpdate(req.params.id, {
            $set: {
                title: req.body.title,
                description: req.body.description,
                category: req.body.category,
            }
        }, { new: true });
        res.status(200).json({ status: httpStatusText.SUCCESS, updatedPost: updatedPost});
    }
});

/**
 * @Update_Post_Image
 * @PUT
*/
module.exports.updatePostImageCtrl = asyncHandler(async (req, res) => {
    if(!req.file) {
        return res.status(400).json({status: httpStatusText.FAIL, message: "No image provided"});
    }
    const post = await Post.findById(req.params.id);
    if(!post) {
        return res.status(404).json({status: httpStatusText.FAIL, message: "The post is not found"});
    }else if(req.user.id !== post.user.toString()){
        return res.status(403).json({status: httpStatusText.FAIL, message: "Access denied, Not allowed"});
    }else {
        await cloudinaryRemoveImage(post.image.publicId);
        const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
        const result = await cloudinaryUploadImage(imagePath);
        const updatedPost = await Post.findByIdAndUpdate(req.params.id, {
            $set: {
                image: {
                    url: result.secure_url,
                    publicId: result.public_id
                }
            }
        }, { new: true });
        res.status(200).json({ status: httpStatusText.FAIL, updatedPostImage: updatedPost});
        fs.unlinkSync(imagePath);
    }
});

/**
 * @Toggle_Like
 * @PUT
*/
module.exports.toggleLikesCtrl = asyncHandler(async (req, res) => {
    const loggedInUser = req.user.id;
    const { id: postId } = req.params;
    let post = await Post.findById(postId);
    if(!post) {
        return res.status(404).json({ status: httpStatusText.FAIL, message: "The post is not exist"});
    }
    const isPostAlreadyLiked = post.likes.find((user) => user.toString() === loggedInUser);
    if(isPostAlreadyLiked) {
        post = await Post.findByIdAndUpdate(postId, {
            $pull: { likes: loggedInUser }
        }, { new: true });
    }else {
        post = await Post.findByIdAndUpdate(postId, {
            $push: { likes: loggedInUser }
        }, { new: true });
    }
    res.status(200).json({ status: httpStatusText.SUCCESS, likedPost: post});
});

