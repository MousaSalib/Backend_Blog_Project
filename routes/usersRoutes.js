const router = require('express').Router();
const { getAllUsersCtrl, getUserProfileCtrl, updateUserProfileCtrl, getUserCountCtrl, uploadProfileImageCtrl, deleteUserProfileCtrl } = require('../controllers/usersControllers');
const { photoUpload } = require('../middlewares/photoUpload');
const validateObjectId = require('../middlewares/validateObjectId');
const { verifyTokenAndAdmin, verifyTokenAndOnlyUser, verifyToken, verifyTokenAndAuthorization } = require('../middlewares/verifyToken');

router.route('/allUsers').get(verifyTokenAndAdmin, getAllUsersCtrl);
router.route('/user/:id')
    .get(validateObjectId, getUserProfileCtrl)
    .put(validateObjectId, verifyTokenAndOnlyUser, updateUserProfileCtrl)
    .delete(validateObjectId, verifyTokenAndAuthorization, deleteUserProfileCtrl);
router.route('/upload_profile_image').post(verifyToken, photoUpload.single('image'), uploadProfileImageCtrl);    
router.route('/count').get(verifyTokenAndAdmin, getUserCountCtrl);    

module.exports = router;