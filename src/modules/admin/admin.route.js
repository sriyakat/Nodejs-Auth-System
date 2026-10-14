
const express = require("express");
const router = express.Router();

const { verifyToken } = require("../../middleware/auth.middleware.js");
const { verifyAdmin } = require("../../middleware/admin.middleware.js");
const { adminOnlyData, getUserPerformance } = require("./admin.controller.js");


router.get(
    "/dashboard",
    verifyToken,
    verifyAdmin,
    adminOnlyData
);

router.get(
    "/performance",
    verifyToken,
    verifyAdmin,
    getUserPerformance
);


module.exports = router;
