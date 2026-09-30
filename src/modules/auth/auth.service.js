// src/modules/auth/auth.service.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authRepository = require('./auth.repository');

const registerUser = async (name, email, password) => {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        // Dhyan dein: Hum yahan 'REGISTER' action aur 'hashedPassword' bhej rahe hain
        const dbResult = await authRepository.executeAuthSP('REGISTER', name, email, hashedPassword);
        return dbResult;
    } catch (error) {
        throw new Error(`Service error: ${error.message}`);
    }
};


const login = async(email, password)=>{
   try{
     const result = await authRepository.executeAuthSP('LOGIN', null, email, null);
     console.log("Database se ye data aaya:", result);
     if(!result){
        return{
            success:false,
            message:"Please enter valid Email"
        }
     }
        // DB wale encrypted password se user ke normal password ko compare karo
        const isPasswordValid = await bcrypt.compare(password, result.Password);
        if(!isPasswordValid){
            return{
                success:false,
                message:"incorrect password "
            }
        }
       // Password sahi hai, toh 2 Tokens Banao
       const AccessToken = jwt.sign(
        {userId: result.Id, email:result.Email, role:result.Role},
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
       );
       //Refresh Token (7 din me expire hoga)
       const RefreshToken = jwt.sign(
         {userId:result.Id, email:result.Email, role:result.Role},
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
       );

       await authRepository.executeAuthSP('UPDATE_REFRESH_TOKEN', null, email, null, RefreshToken);
       //Controller ko dono token aur success message bhej do
      return {
        success:true,
        message:"login Successfully",
        AccessToken: AccessToken,
        RefreshToken: RefreshToken
      }
   }catch(err){
    throw new Error(`Service error: ${err.message}`)
   }
}


// NAYA: Logout User
const logout = async (email) => {
    try {
        await authRepository.executeAuthSP('LOGOUT', null, email, null, null);
        return { success: true };
    } catch (error) {
        throw new Error(`Logout service error: ${error.message}`);
    }
};


//Reset Password Service
const resetPassword = async (email, newPassword) => {
    try {
        // Naye password ko hash (encrypt) karo
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        
        // Database me update karo (Action: 'RESET_PASSWORD')
        const dbResult = await authRepository.executeAuthSP('RESET_PASSWORD', null, email, hashedNewPassword, null);
        
        return dbResult;
    } catch (error) {
        throw new Error(`Reset password service error: ${error.message}`);
    }
};


module.exports = {
    registerUser,
    login,
    logout,
    resetPassword
};