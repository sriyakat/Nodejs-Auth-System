
const userRepository = require("./user.repository.js");

const getUserProfile = async (userId) => {
    const user = await userRepository.getUserProfile(userId);
    if (!user) {
        const error = new Error("User profile not found.");
        error.statusCode = 404;
        throw error;
    }
    return {
        id: user.Id,
        name: user.Name,
        email: user.Email,
        role: user.Role
    };
};

const createOutputEntry = async (userId, output) => {
    return userRepository.createOutputEntry(userId, output);
};

const getUserOutputEntries = async (userId) => {
    return userRepository.getUserOutputEntries(userId);
};


module.exports = {
    getUserProfile,
    createOutputEntry,
    getUserOutputEntries
};
