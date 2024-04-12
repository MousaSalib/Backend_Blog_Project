const router = require('express').Router();
const { registerUserCtrl, loginUserCtrl } = require('../controllers/authController');

router.post('/auth/register', registerUserCtrl);
router.post('/auth/login', loginUserCtrl);

module.exports = router;