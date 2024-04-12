const mongoose = require('mongoose');
const httpStatusText = require('../utils/httpStatusText');

module.exports = (req, res, next) => {
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({status: httpStatusText.FAIL, message: 'Invalid object id'});
    }else {
        next();
    }
};