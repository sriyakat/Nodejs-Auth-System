//Sirf Admin ke liye function
// const adminOnlyData = (req, res) => {
//     res.status(200).json({
//         success: true,
//         message: "Welcome Boss! Ye Admin ka private dashboard hai.",
//         adminDetails: req.user 
//     });
// };



const adminService = require("./admin.service.js");

const adminOnlyData = async (req, res, next) => {
    try {
        const dashboardData = await adminService.getAdminDashboardData(req.user);
        
        return res.status(200).json({
            success: true,
            message: "Welcome Boss! Ye Admin ka private dashboard hai.",
            data: dashboardData
        });
    } catch (error) {
        next(error)
    }
};

const getUserPerformance = async (req, res, next) => {
    try {
        const users = await adminService.getUserPerformance(req.user);
        const totals = users.reduce((summary, user) => ({
            users: summary.users + 1,
            todayQuantity: summary.todayQuantity + Number(user.todayQuantity),
            monthQuantity: summary.monthQuantity + Number(user.monthQuantity)
        }), { users: 0, todayQuantity: 0, monthQuantity: 0 });

        return res.status(200).json({
            success: true,
            data: {
                totals,
                users
            }
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    adminOnlyData,
    getUserPerformance
};
