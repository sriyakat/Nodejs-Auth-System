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
         accessToken: result.AccessToken
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


//Reset Password Controller
const resetPasswordController = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        
        const result = await authService.resetPassword(email, newPassword);

        if (result.Status === 'Error') {
            return res.status(404).json({ success: false, message: result.Message });
        }

        return res.status(200).json({ success: true, message: result.Message });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error in reset password." });
    }
};


module.exports = {
    register,
    login,
    logout,
    resetPasswordController
};