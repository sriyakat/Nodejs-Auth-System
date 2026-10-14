
const verifyAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required."
        });
    }
    if (typeof req.user.role !== "string" || req.user.role.toLowerCase() !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Access denied. Admin only."
        });
    }
    next();
};


module.exports = {
    verifyAdmin
};
