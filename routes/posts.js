const express = require("express");
const postsController = require("../controllers/postsController");
const router = express.Router();
const passport = require("passport");

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  postsController.posts_get
);
router.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  postsController.post_get
);

module.exports = router;
