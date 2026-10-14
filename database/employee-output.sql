IF OBJECT_ID(N'dbo.EmployeeOutput', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.EmployeeOutput (
        Id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_EmployeeOutput PRIMARY KEY,
        UserId INT NOT NULL,
        WorkDate DATE NOT NULL,
        Quantity DECIMAL(12, 2) NOT NULL,
        Notes NVARCHAR(250) NULL,
        CreatedAt DATETIME2(0) NOT NULL
            CONSTRAINT DF_EmployeeOutput_CreatedAt DEFAULT SYSUTCDATETIME(),
        CONSTRAINT CK_EmployeeOutput_Quantity CHECK (Quantity > 0),
        CONSTRAINT FK_EmployeeOutput_Users
            FOREIGN KEY (UserId) REFERENCES dbo.Users(Id) ON DELETE CASCADE
    );

    CREATE INDEX IX_EmployeeOutput_UserId_WorkDate
        ON dbo.EmployeeOutput(UserId, WorkDate DESC);

    CREATE INDEX IX_EmployeeOutput_WorkDate_UserId
        ON dbo.EmployeeOutput(WorkDate DESC, UserId);
END;
