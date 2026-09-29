// src/modules/auth/auth.middleware.js
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // Frontend token ko hamesha 'Authorization' header me bhejta hai ("Bearer <token>" format me)
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(403).json({ success: false, message: "Access denied. Token nahi mila." });
    }

    // "Bearer eyJhbGci..." isme se sirf token nikalne ke liye split karte hain
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decodedUser) => {
        if (err) {
            return res.status(401).json({ 
                success: false, 
                message: "Token invalid ya expire ho chuka hai." 
            });
        }

        // Agar token sahi hai, toh token me chhupe user ke data (userId, email) ko request me daal do
        // Taaki aage Controller is data ka use kar sake
        req.user = decodedUser; 
        next(); 
    });
};


module.exports = {
    verifyToken
};