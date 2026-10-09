IF OBJECT_ID(N'dbo.PasswordResetTokens', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.PasswordResetTokens (
        Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        UserId INT NOT NULL,
        TokenHash CHAR(64) NOT NULL,
        ExpiresAt DATETIME2(3) NOT NULL,
        UsedAt DATETIME2(3) NULL,
        CreatedAt DATETIME2(3) NOT NULL
            CONSTRAINT DF_PasswordResetTokens_CreatedAt DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_PasswordResetTokens_Users
            FOREIGN KEY (UserId) REFERENCES dbo.Users(Id) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'UX_PasswordResetTokens_TokenHash'
      AND object_id = OBJECT_ID(N'dbo.PasswordResetTokens')
)
BEGIN
    CREATE UNIQUE INDEX UX_PasswordResetTokens_TokenHash
        ON dbo.PasswordResetTokens(TokenHash);
END;

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_PasswordResetTokens_UserId'
      AND object_id = OBJECT_ID(N'dbo.PasswordResetTokens')
)
BEGIN
    CREATE INDEX IX_PasswordResetTokens_UserId
        ON dbo.PasswordResetTokens(UserId, UsedAt);
END;
