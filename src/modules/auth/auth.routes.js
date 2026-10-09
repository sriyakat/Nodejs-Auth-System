// src/modules/auth/auth.routes.js
const express = require('express');
const { rateLimit } = require('express-rate-limit');
const router = express.Router();
const authController = require('./auth.controller');
const authValidation = require("./auth.validation");
const { verifyToken, authorizeRole } = require('../../middleware/auth.middleware.js');

const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many reset requests. Please try again later.'
    }
});

const resetPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many reset attempts. Please try again later.'
    }
});

router.post('/register',authValidation.validateRegister, authController.register);
router.post('/login',authValidation.validateLogin, authController.login);
router.post('/logout', verifyToken, authController.logout);
router.post('/forgot-password', forgotPasswordLimiter, authValidation.validateForgotPassword, authController.forgotPasswordController);
router.post('/reset-password', resetPasswordLimiter, authValidation.validateResetPassword, authController.resetPasswordController);
router.get('/admin-dashboard', verifyToken, authorizeRole('Admin'), authController.adminOnlyData);


// Ek test profile route aapke check karne ke liye
router.get('/profile', verifyToken, (req, res) => {
    // req.user me humein userId aur email mil jayega
    res.json({ success: true, message: "Welcome to VIP area!", user: req.user });
})

module.exports = router;