const httpStatusText = require('../utils/httpStatusText');
const JWT = require('jsonwebtoken');

function verifyToken(req, res, next) {
    const authToken = req.headers.authorization;
    if(authToken) {
        const token = authToken.split(" ")[1];
        try{
            const decodedPayload = JWT.verify(token, process.env.JWT_SECRET_KEY);
            req.user = decodedPayload;
            next();
        }catch(error) {
            return res.status(401).json({status: httpStatusText.FAIL, message: 'Invalid token, access denied'})
        }
    }else {
        return res.status(401).json({status: httpStatusText.FAIL, message: 'No token provided, access denied'})
    }
};

function verifyTokenAndAdmin(req, res, next) {
    verifyToken(req, res, () => {
        if(req.user.isAdmin) {
            next()
        }else {
            return res.status(403).json({status: httpStatusText.FAIL, message: 'Not allowed, Only admin'})
        }
    })
};

function verifyTokenAndOnlyUser(req, res, next) {
    verifyToken(req, res, () => {
        if(req.user.id === req.params.id) {
            next()
        }else {
            return res.status(403).json({status: httpStatusText.FAIL, message: "Not allowed, Only user himself"})
        }
    })
};

function verifyTokenAndAuthorization(req, res, next) {
    verifyToken(req, res, () => {
        if(req.user.id === req.params.id || req.user.isAdmin) {
            next()
        }else {
            return res.status(403).json({status: httpStatusText.FAIL, message: "Not allowed, Only user himself"})
        }
    })
}

module.exports = {
    verifyToken,
    verifyTokenAndAdmin,
    verifyTokenAndOnlyUser,
    verifyTokenAndAuthorization,
};