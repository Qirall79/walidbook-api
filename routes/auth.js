const express = require("express");
const authController = require("../controllers/authController");
const router = express.Router();
const passport = require("passport");

router.post("/login", authController.login);

module.exports = router;
