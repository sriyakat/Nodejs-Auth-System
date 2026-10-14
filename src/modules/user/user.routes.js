
const express = require("express");
const router = express.Router();

const { verifyToken } = require("../../middleware/auth.middleware.js");
const { validateUserProfile, validateOutputEntry } = require("./user.validation.js");
const { getUserProfile, createOutputEntry, getMyOutputEntries } = require("./user.controller.js");

router.get(
    "/profile",
    verifyToken,
    validateUserProfile,
    getUserProfile
);


router.route("/performance")
    .get(verifyToken, validateUserProfile, getMyOutputEntries)
    .post(verifyToken, validateUserProfile, validateOutputEntry, createOutputEntry);

 
module.exports = router;
