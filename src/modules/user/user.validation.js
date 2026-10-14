
const Joi = require("joi");

const validateUserProfile = (req, res, next) => {
    const userId = req.user?.userId;

    if (
        userId === undefined ||
        userId === null ||
        !Number.isSafeInteger(Number(userId)) ||
        Number(userId) <= 0
    ) {
        return res.status(401).json({
            success: false,
            message: "Invalid authenticated user."
        });
    }
    next();
};

const validateOutputEntry = (req, res, next) => {
    const schema = Joi.object({
        workDate: Joi.date().iso().required(),
        quantity: Joi.number().positive().max(9999999999.99).precision(2).required(),
        notes: Joi.string().trim().max(250).allow("").optional()
    });
    const { error, value } = schema.validate(req.body, { convert: true });

    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });
    }

    const workDate = new Date(`${value.workDate.toISOString().slice(0, 10)}T00:00:00.000Z`);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (workDate > today) {
        return res.status(400).json({
            success: false,
            message: "Work date cannot be in the future."
        });
    }

    req.validatedOutput = {
        workDate: value.workDate.toISOString().slice(0, 10),
        quantity: value.quantity,
        notes: value.notes || null
    };
    next();
};


module.exports = {
    validateUserProfile,
    validateOutputEntry
};
