const router = require('express').Router();
const { createCategoryCtrl, getAllCategoriesCtrl, deleteCategoryCtrl } = require('../controllers/categoriesControllers');
const { verifyTokenAndAdmin } = require('../middlewares/verifyToken');
const validateObjectId = require('../middlewares/validateObjectId');

router.route('/')
    .post(verifyTokenAndAdmin, createCategoryCtrl)
    .get(verifyTokenAndAdmin, getAllCategoriesCtrl);
router.route("/:id").delete(validateObjectId, verifyTokenAndAdmin, deleteCategoryCtrl);


module.exports = router