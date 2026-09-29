// src/modules/auth/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const authValidation = require("./auth.validation");
const { verifyToken } = require('../../middleware/auth.middleware.js');


router.post('/register',authValidation.validateRegister, authController.register);
router.post('/login',authValidation.validateLogin, authController.login);
router.post('/logout', verifyToken, authController.logout);
router.post('/reset-password', authValidation.validateResetPassword, authController.resetPasswordController);


// Ek test profile route aapke check karne ke liye
router.get('/profile', verifyToken, (req, res) => {
    // req.user me humein userId aur email mil jayega
    res.json({ success: true, message: "Welcome to VIP area!", user: req.user });
})

module.exports = router;