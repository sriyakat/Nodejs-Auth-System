-- Run employee-output.sql first to create dbo.EmployeeOutput.
-- SUBMIT saves an entry, LIST_MINE returns a user's recent entries,
-- and ADMIN_SUMMARY returns aggregated output for non-admin accounts.
CREATE OR ALTER PROCEDURE dbo.sp_ManageEmployeeOutput
    @Action VARCHAR(30),
    @UserId INT = NULL,
    @WorkDate DATE = NULL,
    @Quantity DECIMAL(12, 2) = NULL,
    @Notes NVARCHAR(250) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @Action = 'SUBMIT'
    BEGIN
        IF @UserId IS NULL OR @WorkDate IS NULL OR @Quantity IS NULL OR @Quantity <= 0
            THROW 50001, 'User, work date, and a positive quantity are required.', 1;

        INSERT INTO dbo.EmployeeOutput (UserId, WorkDate, Quantity, Notes)
        OUTPUT
            INSERTED.Id AS id,
            INSERTED.WorkDate AS workDate,
            INSERTED.Quantity AS quantity,
            INSERTED.Notes AS notes,
            INSERTED.CreatedAt AS createdAt
        VALUES (@UserId, @WorkDate, @Quantity, @Notes);

        RETURN;
    END;

    IF @Action = 'LIST_MINE'
    BEGIN
        IF @UserId IS NULL
            THROW 50002, 'User ID is required.', 1;

        SELECT TOP (100)
            Id AS id,
            WorkDate AS workDate,
            Quantity AS quantity,
            Notes AS notes,
            CreatedAt AS createdAt
        FROM dbo.EmployeeOutput
        WHERE UserId = @UserId
        ORDER BY WorkDate DESC, Id DESC;

        RETURN;
    END;

    IF @Action = 'ADMIN_SUMMARY'
    BEGIN
        SELECT
            u.Id AS id,
            u.Name AS name,
            u.Email AS email,
            u.Role AS role,
            COALESCE(SUM(o.Quantity), 0) AS totalQuantity,
            COALESCE(SUM(CASE
                WHEN o.WorkDate = CONVERT(date, GETDATE()) THEN o.Quantity
                ELSE 0
            END), 0) AS todayQuantity,
            COALESCE(SUM(CASE
                WHEN o.WorkDate >= DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1)
                    AND o.WorkDate < DATEADD(month, 1, DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1))
                    THEN o.Quantity
                ELSE 0
            END), 0) AS monthQuantity,
            MAX(o.WorkDate) AS lastWorkDate
        FROM dbo.Users AS u
        LEFT JOIN dbo.EmployeeOutput AS o ON o.UserId = u.Id
        WHERE LOWER(LTRIM(RTRIM(ISNULL(u.Role, 'User')))) <> 'admin'
        GROUP BY u.Id, u.Name, u.Email, u.Role
        ORDER BY monthQuantity DESC, u.Name ASC;

        RETURN;
    END;

    THROW 50003, 'Unsupported employee output action.', 1;
END;
