const asyncHandler = require('express-async-handler');
const { User, validateUpdateUser } = require('../models/User');
const httpStatusText = require('../utils/httpStatusText');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const { cloudinaryUploadImage, cloudinaryRemoveImage, cloudinaryRemoveMultipleImages } = require('../utils/cloudinary');
const { Post } = require('../models/Post');
const { Comment } = require('../models/Comment');


/**
 * @Get_All_Users
 * @GET
*/
module.exports.getAllUsersCtrl = asyncHandler(async(req, res) => {
    const users = await User.find().select('-password').populate('posts');
    if(!users) {
        return res.status(404).json({status: httpStatusText.FAIL, message: 'Not found users'})
    }else {
        res.status(200).json({status: httpStatusText.SUCCESS, data: {users}});
    }
});

/** 
 * @Get_User
 * @GET
*/
module.exports.getUserProfileCtrl = asyncHandler(async(req, res) => {
    const user = await User.findById(req.params.id).select('-password').populate('posts');
    if(!user) {
        return res.status(404).json({status: httpStatusText.FAIL, message: 'User is not exist'});
    }else {
        res.status(200).json({status: httpStatusText.SUCCESS, data: {user}});
    }
});

/**
 * @Update_User
 * @PUT
*/
module.exports.updateUserProfileCtrl = asyncHandler(async (req, res) => {
    let { error } = validateUpdateUser(req.body)
    if(error) {
        return res.status(400).json({status: httpStatusText.FAIL, message: error.details[0].message});
    }else {
        if(req.body.password) {
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password, salt);
        };
        const updatedUser = await User.findByIdAndUpdate(req.params.id, {
            $set: {
                username: req.body.username,
                password: req.body.password,
                bio: req.body.bio,
            }
        }, {new: true}).select("-password");
        res.status(200).json({status: httpStatusText.SUCCESS, updatedUser});
    };
});

/**
 * @Get_The_Number_Of_Users
 * @GET
*/
module.exports.getUserCountCtrl = asyncHandler(async (req, res) => {
    const countedUsers = await User.countDocuments();
    res.status(200).json({status: httpStatusText.SUCCESS, countedUsers})
});

/**
 * @Upload_Profile_Photo
 * @POST
*/
module.exports.uploadProfileImageCtrl = asyncHandler(async (req, res) => {
    if(!req.file) {
        return res.status(400).json({status: httpStatusText.FAIL, message: "No image provided"});
    }else {
        const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
        const result = await cloudinaryUploadImage(imagePath);
        const user = await User.findById(req.user.id);
        if(user.profilePhoto.publicId !== null) {
            await cloudinaryRemoveImage(user.profilePhoto.publicId)
        }else {
            user.profilePhoto = {
                url: result.secure_url,
                publicId: result.public_id
            }
            await user.save();
        }
        res.status(200).json({status: httpStatusText.SUCCESS, message: "Your image uploaded successfully", profilePhoto: {
            url: result.secure_url,
            publicId: result.public_id
        }});
        fs.unlinkSync(imagePath);
    }
});

/**
 * @Delete_User
 * @DELETE
*/
module.exports.deleteUserProfileCtrl = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if(!user) {
        return res.status(404).json({status: httpStatusText.FAIL, message: "User is not exist"});
    }
        const posts = await Post.find({ user: user._id });
        const publicIds = posts?.map((post) => post.image.publicId);
        if(publicIds?.length > 0) {
            await cloudinaryRemoveMultipleImages(publicIds);
        };
        await cloudinaryRemoveImage(user.profilePhoto.publicId);
        await Post.deleteMany({ user: user._id });
        await Comment.deleteMany({ user: user._id });
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({status: httpStatusText.SUCCESS, message: "Your profile deleted successfully"});
});