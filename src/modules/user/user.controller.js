
const userService = require("./user.service");

const getUserProfile = async (req, res, next) => {
    try {
        const userId = Number(req.user.userId);
        const profile = await userService.getUserProfile(userId);

        return res.status(200).json({
            success: true,
            message: "User profile fetched successfully.",
            data: profile
        });
    } catch (error) {
      next(error)
    }
};

const createOutputEntry = async (req, res, next) => {
    try {
        const userId = Number(req.user.userId);
        const entry = await userService.createOutputEntry(userId, req.validatedOutput);
        return res.status(201).json({
            success: true,
            message: "Work output saved successfully.",
            data: entry
        });
    } catch (error) {
        next(error);
    }
};

const getMyOutputEntries = async (req, res, next) => {
    try {
        const userId = Number(req.user.userId);
        const entries = await userService.getUserOutputEntries(userId);
        return res.status(200).json({
            success: true,
            data: entries
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    getUserProfile,
    createOutputEntry,
    getMyOutputEntries
};
