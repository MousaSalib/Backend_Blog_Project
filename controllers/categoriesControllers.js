const asyncHandler = require('express-async-handler');
const httpStatusText = require('../utils/httpStatusText');
const { validateCreateCategory, Category } = require('../models/Category');

/**
 * @Create_Category
 * @POST
*/
module.exports.createCategoryCtrl = asyncHandler(async (req, res) => {
    const { error } = validateCreateCategory(req.body);
    if(error) {
        return res.status(400).json({ status: httpStatusText.FAIL, message: error.details[0].message });
    }
        const category = await Category.create({
            title: req.body.title,
            user: req.user.id
        });
        res.status(201).json({ status: httpStatusText.SUCCESS, category: category });
    
});

/**
 * @Get_All_Categories
 * @GET
*/
module.exports.getAllCategoriesCtrl = asyncHandler(async (req, res) => {
    const categories = await Category.find();
    res.status(200).json({ status: httpStatusText.SUCCESS, categories:  categories });
});

/**
 * @Delete_Categories
 * @DELETE
*/
module.exports.deleteCategoryCtrl = asyncHandler(async(req, res) => {
    const category = await Category.findById(req.params.id);
    if(!category) {
        return res.status(404).json({ status: httpStatusText.FAIL, message: "No categories exist"});
    }else {
        await Category.findByIdAndDelete(req.params.id);
        res.status(200).json({ status: httpStatusText.SUCCESS, message: "The category deleted successfully"});
    }
})