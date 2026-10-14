const { sql, poolPromise } = require("../../config/db.js");

const getAdminById = async (userId) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input("UserId", sql.Int, userId)
        .query(`
            SELECT Id, Name, Email, Role
            FROM dbo.Users
            WHERE Id = @UserId
        `);

    return result.recordset[0] || null;
};

const getUserPerformance = async () => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input("Action", sql.VarChar(30), "ADMIN_SUMMARY")
        .execute("dbo.sp_ManageEmployeeOutput");

    return result.recordset;
};

module.exports = {
    getAdminById,
    getUserPerformance
};