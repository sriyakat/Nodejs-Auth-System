// src/modules/auth/auth.repository.js
const { sql, poolPromise } = require('../../config/db');

const executeAuthSP = async (action, name, email, password, refreshToken = null) => {
    try {
        const pool = await poolPromise; 
        const result = await pool.request()
            .input('Action', sql.VarChar, action)
            .input('Name', sql.VarChar, name)
            .input('Email', sql.VarChar, email)
            .input('Password', sql.VarChar, password)
            .input('RefreshToken', sql.VarChar, refreshToken)
            .execute('sp_UserAuth');
            
        return result.recordset[0]; 
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

module.exports = {
    executeAuthSP
};