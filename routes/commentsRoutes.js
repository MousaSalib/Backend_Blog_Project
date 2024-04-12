const router = require('express').Router();
const { createCommentCtrl, getAllCommentsCtrl, deleteCommentCtrl, updateCommentCtrl } = require('../controllers/commentsControllers');
const { verifyToken, verifyTokenAndAdmin } = require('../middlewares/verifyToken');
const validateObjectId = require('../middlewares/validateObjectId');

router.route('/')
    .post(verifyToken, createCommentCtrl)
    .get(verifyToken, verifyTokenAndAdmin, getAllCommentsCtrl);
router.route('/:id')
    .delete(verifyToken, validateObjectId, deleteCommentCtrl)
    .put(validateObjectId, verifyToken, updateCommentCtrl);

module.exports = router;