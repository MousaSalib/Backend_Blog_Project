const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const { validateRegisterUser, User, validateLoginUser } = require('../models/User');
const httpStatusText = require('../utils/httpStatusText');

/** 
 * Registration
*/

module.exports.registerUserCtrl = asyncHandler(async (req, res) => {
    const { error } = validateRegisterUser(req.body);
    if(error) {
        return res.status(400).json({status: httpStatusText.FAIL, message: error.details[0].message});
    }else {
        let existedUser = await User.findOne({email: req.body.email});
        if(existedUser) {
            return res.status(400).json({status: httpStatusText.FAIL, message: 'User already exist!'});
        }else {
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(req.body.password, salt);
            const user = new User({
                username: req.body.username,
                password: hashPassword,
                email: req.body.email,
            });
            await user.save();
            res.status(201).json({status: httpStatusText.SUCCESS, message: 'You have been registered successfully'});
        }
    }
});

/**
 * Login
*/

module.exports.loginUserCtrl = asyncHandler(async (req, res) => {
    let { error } = validateLoginUser(req.body);
    if (error) {
        return res.status(400).json({ status: httpStatusText.FAIL, message: error.details[0].message });
    }

    const existedUser = await User.findOne({ email: req.body.email });
    if (!existedUser) {
        return res.status(404).json({ status: httpStatusText.FAIL, message: 'User not found!' });
    }

    const passwordMatched = await bcrypt.compare(req.body.password, existedUser.password);
    if (!passwordMatched) {
        return res.status(400).json({ status: httpStatusText.FAIL, message: 'Password is not correct!' });
    }

    const token = existedUser.generateAuthToken();
    res.status(200).json({
        status: httpStatusText.SUCCESS,
        message: 'You logged in successfully',
        _id: existedUser._id,
        isAdmin: existedUser.isAdmin,
        profilePhoto: existedUser.profilePhoto,
        token,
    });
});

