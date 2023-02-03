const express = require("express");
const indexController = require("../controllers/indexController");
const router = express.Router();
const passport = require("passport");

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  indexController.home
);

module.exports = router;
