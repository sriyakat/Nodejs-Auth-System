const { sql, poolPromise} = require("../../config/db.js")

const getUserProfile = async (userId) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("UserId", sql.Int, userId)
            .execute("sp_GetUserProfile");

        return result.recordset[0] || null;
    } catch (error) {
        throw error;
    }
};

const createOutputEntry = async (userId, { workDate, quantity, notes }) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input("Action", sql.VarChar(30), "SUBMIT")
        .input("UserId", sql.Int, userId)
        .input("WorkDate", sql.Date, workDate)
        .input("Quantity", sql.Decimal(12, 2), quantity)
        .input("Notes", sql.NVarChar(250), notes)
        .execute("dbo.sp_ManageEmployeeOutput");

    return result.recordset?.[0] || null;
};

const getUserOutputEntries = async (userId) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input("Action", sql.VarChar(30), "LIST_MINE")
        .input("UserId", sql.Int, userId)
        .execute("dbo.sp_ManageEmployeeOutput");

    return result.recordset;
};


module.exports = {
    getUserProfile,
    createOutputEntry,
    getUserOutputEntries
};
