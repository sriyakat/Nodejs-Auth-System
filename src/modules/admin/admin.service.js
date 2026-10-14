
const adminRepository = require("./admin.repository");

const getAdminDashboardData = async (admin) => {
    if (!admin || admin.role?.toLowerCase() !== "admin") {
        const error = new Error("Admin access required.");
        error.statusCode = 403;
        throw error;
    }

    const userId = Number(admin.userId);
    if (!Number.isSafeInteger(userId) || userId <= 0) {
        const error = new Error("Invalid admin account.");
        error.statusCode = 401;
        throw error;
    }

    const adminAccount = await adminRepository.getAdminById(userId);
    if (!adminAccount) {
        const error = new Error("Admin account not found.");
        error.statusCode = 404;
        throw error;
    }
    if (adminAccount.Role?.toLowerCase() !== "admin") {
        const error = new Error("Admin access has been removed. Please sign in again.");
        error.statusCode = 403;
        throw error;
    }

    return {
        id: adminAccount.Id,
        name: adminAccount.Name,
        email: adminAccount.Email,
        role: adminAccount.Role
    };
};

const getUserPerformance = async (admin) => {
    await getAdminDashboardData(admin);
    return adminRepository.getUserPerformance();
};

module.exports = {
    getAdminDashboardData,
    getUserPerformance
};
