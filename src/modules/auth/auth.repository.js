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

const createPasswordResetToken = async (email, tokenHash, expiresAt) => {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    let transactionStarted = false;

    try {
        await transaction.begin();
        transactionStarted = true;
        const request = new sql.Request(transaction);
        const userResult = await request
            .input('Email', sql.VarChar(100), email)
            .query('SELECT Id FROM dbo.Users WITH (UPDLOCK, HOLDLOCK) WHERE Email = @Email');
        const user = userResult.recordset[0];

        if (!user) {
            await transaction.commit();
            return false;
        }

        await new sql.Request(transaction)
            .input('UserId', sql.Int, user.Id)
            .query('DELETE FROM dbo.PasswordResetTokens WHERE UserId = @UserId AND UsedAt IS NULL');

        await new sql.Request(transaction)
            .input('UserId', sql.Int, user.Id)
            .input('TokenHash', sql.Char(64), tokenHash)
            .input('ExpiresAt', sql.DateTime2, expiresAt)
            .query(`
                INSERT INTO dbo.PasswordResetTokens (UserId, TokenHash, ExpiresAt)
                VALUES (@UserId, @TokenHash, @ExpiresAt)
            `);

        await transaction.commit();
        return true;
    } catch (error) {
        if (transactionStarted) {
            await transaction.rollback();
        }
        throw new Error(`Password reset token storage failed: ${error.message}`);
    }
};

const consumePasswordResetToken = async (tokenHash, passwordHash) => {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    let transactionStarted = false;

    try {
        await transaction.begin();
        transactionStarted = true;
        const request = new sql.Request(transaction);
        const tokenResult = await request
            .input('TokenHash', sql.Char(64), tokenHash)
            .query(`
                SELECT Id, UserId
                FROM dbo.PasswordResetTokens WITH (UPDLOCK, ROWLOCK)
                WHERE TokenHash = @TokenHash
                    AND UsedAt IS NULL
                    AND ExpiresAt > SYSUTCDATETIME()
            `);
        const token = tokenResult.recordset[0];

        if (!token) {
            await transaction.rollback();
            return false;
        }

        await new sql.Request(transaction)
            .input('Id', sql.Int, token.Id)
            .query('UPDATE dbo.PasswordResetTokens SET UsedAt = SYSUTCDATETIME() WHERE Id = @Id');

        await new sql.Request(transaction)
            .input('UserId', sql.Int, token.UserId)
            .input('Password', sql.VarChar(255), passwordHash)
            .query('UPDATE dbo.Users SET Password = @Password, RefreshToken = NULL WHERE Id = @UserId');

        await transaction.commit();
        return true;
    } catch (error) {
        if (transactionStarted) {
            await transaction.rollback();
        }
        throw new Error(`Password reset failed: ${error.message}`);
    }
};

module.exports = {
    executeAuthSP,
    createPasswordResetToken,
    consumePasswordResetToken
};