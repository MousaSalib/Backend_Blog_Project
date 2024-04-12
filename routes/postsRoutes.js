const router = require('express').Router();
const { verifyToken } = require('../middlewares/verifyToken');
const  { photoUpload }  = require('../middlewares/photoUpload');
const { createPostCtrl, getAllPostsCtrl, getSinglePostCtrl, getPostsCountCtrl, deletePostCtrl, updatePostCtrl, updatePostImageCtrl, toggleLikesCtrl } = require('../controllers/postControllers');
const validateObjectId = require('../middlewares/validateObjectId');

router.route('/')
    .post(verifyToken, photoUpload.single("image"), createPostCtrl)
    .get(getAllPostsCtrl);
router.route('/count').get(getPostsCountCtrl); 
router.route('/:id')
    .get(validateObjectId, getSinglePostCtrl)
    .delete(validateObjectId, verifyToken, deletePostCtrl)
    .put(validateObjectId, verifyToken, updatePostCtrl);
    
router.route('/update_post_image/:id').put(validateObjectId, verifyToken, photoUpload.single('image'), updatePostImageCtrl);
router.route('/like/:id').put(validateObjectId, verifyToken, toggleLikesCtrl);       

module.exports = router;