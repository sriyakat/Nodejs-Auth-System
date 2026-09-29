const Joi = require('joi');

// Register validation==================================
const registerSchema = Joi.object({
    name: Joi.string().min(3).max(50).required().messages({
        'string.empty': 'Naam khali nahi chhod sakte',
        'string.min': 'Naam kam se kam 3 letters ka hona chahiye'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Sahi email ID daalein',
        'string.empty': 'Email khali nahi chhod sakte'
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password kam se kam 6 characters ka hona chahiye',
        'string.empty': 'Password daalna zaroori hai'
    })
});

// Login validation====================================
const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});


// Register ke liye Security Guard
const validateRegister = (req, res, next) => {
    // req.body ka data hamare rules (registerSchema) se match karo
    const { error } = registerSchema.validate(req.body);
    
    if (error) {
        // Agar rule toota hai, toh yahin se error bhej do (Controller tak mat jane do)
        return res.status(400).json({ 
            success: false, 
            message: error.details[0].message // Joi ka custom message
        });
    }
    next(); 
};

// Login ke liye Security Guard
const validateLogin = (req, res, next) => {
    const { error } = loginSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }
    next();
};


// Reset Password ka rule
const resetPasswordSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Sahi email ID daalein'
    }),
    newPassword: Joi.string().min(6).required().messages({
        'string.min': 'Naya password kam se kam 6 characters ka hona chahiye'
    })
});

const validateResetPassword = (req, res, next) => {
    const { error } = resetPasswordSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }
    next();
};


module.exports = {
    validateRegister,
    validateLogin,
    validateResetPassword
};