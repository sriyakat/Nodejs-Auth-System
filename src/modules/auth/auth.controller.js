// src/modules/auth/auth.controller.js
const authService = require('./auth.service');

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const result = await authService.registerUser(name, email, password);

        if (result.Status === 'Error') {
            return res.status(400).json({ 
                success: false, 
                message: result.Message 
            });
        }
        return res.status(201).json({ 
            success: true, 
            message: result.Message 
        });
    } catch (error) {
        console.error("Register Controller Error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Server me kuch error aayi hai, kripya baad me try karein." 
        });
    }
};


const login = async(req, res, next)=>{
    try{ 
    const {email, password} = req.body;

    const result = await authService.login(email, password);
    if(!result.success){
        return res.status(401).json({
            success:false,
            message:"Please enter the correct email & password",
        });
    }
    res.cookie("RefreshToken", result.RefreshToken, {
        httpOnly: true,       // JavaScript is cookie ko padh nahi sakta (Security)
        secure: false,        // Localhost par false rakhte hain. Production (HTTPS) me ise 'true' karna hota hai
        sameSite: 'strict',   // Kisi aur website se request aane par ye cookie nahi jayegi (CSRF protection)
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 din milliseconds me
    });
    return res.status(200).json({
         success: true, 
         message: result.message,
         accessToken: result.AccessToken,
         user: result.user
    });
    }catch(err){
        next(err)
    }
}


const logout = async (req, res) => {
    try {
        const email = req.user.email; 
        //Database se RefreshToken delete 
        await authService.logout(email);

        // 2. Browser ki Cookie clear karo
        res.clearCookie('RefreshToken', { httpOnly: true, sameSite: 'strict' });

        return res.status(200).json({ success: true, message: "Aap successfully logout ho chuke hain." });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error during logout." });
    }
};


const forgotPasswordController = async (req, res) => {
    try {
        await authService.requestPasswordReset(req.body.email);
        return res.status(200).json({
            success: true,
            message: "If an account exists for that email, a password reset link will be sent."
        });
    } catch (error) {
        console.error("Forgot Password Controller Error:", error);
        if (error.code === 'EMAIL_NOT_CONFIGURED') {
            return res.status(503).json({
                success: false,
                message: "Password reset email is not configured. Replace the SMTP placeholders in .env and restart the backend."
            });
        }
        if (error.code === 'SMTP_TLS_CERTIFICATE_ERROR') {
            return res.status(502).json({
                success: false,
                message: "Secure email connection failed because Node.js does not trust the SMTP certificate. Configure a trusted CA certificate or disable SMTP SSL inspection in your antivirus, VPN, or proxy. Do not disable TLS certificate verification."
            });
        }
        if (error.code === 'SMTP_TLS_CA_FILE_ERROR') {
            return res.status(503).json({
                success: false,
                message: "The SMTP_CA certificate file could not be read. Check SMTP_TLS_CA_FILE in .env."
            });
        }
        return res.status(500).json({
            success: false,
            message: "Unable to send a password reset email right now."
        });
    }
};

const resetPasswordController = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const reset = await authService.resetPassword(token, newPassword);

        if (!reset) {
            return res.status(400).json({
                success: false,
                message: "This password reset link is invalid, expired, or already used."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Password updated. You can now sign in with your new password."
        });
    } catch (error) {
        console.error("Reset Password Controller Error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to reset your password right now."
        });
    }
};


module.exports = {
    register,
    login,
    logout,
    forgotPasswordController,
    resetPasswordController
};