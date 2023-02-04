const express = require("express");
const router = express.Router();
const passport = require("passport");
const usersController = require("../controllers/usersController");

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  usersController.currentUser_get
);
router.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  usersController.user_get
);

module.exports = router;
