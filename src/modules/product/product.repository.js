// src/modules/products/product.repository.js
const { sql, poolPromise } = require('../../config/db');

const executeProductSP = async (action, id = null, name = null, price = null, description = null) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Action', sql.VarChar(20), action)
            .input('Id', sql.Int, id)
            .input('Name', sql.VarChar(100), name)
            .input('Price', sql.Decimal(10, 2), price)
            .input('Description', sql.VarChar(255), description)
            .execute('sp_ManageProducts'); // Hamara database wala SP

        return result.recordset;
    } catch (error) {
        console.error("Products Database Error: ", error);
        throw error;
    }
};

module.exports = {
    executeProductSP
};