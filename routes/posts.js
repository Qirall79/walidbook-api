const express = require("express");
const postsController = require("../controllers/postsController");
const router = express.Router();
const passport = require("passport");

router.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  postsController.posts_get
);
router.put(
  "/:id/likes",
  passport.authenticate("jwt", { session: false }),
  postsController.likes_update
);
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  postsController.post_delete
);

router.post(
  "/:id/comments",
  passport.authenticate("jwt", { session: false }),
  postsController.post_comment
);

router.delete(
  "/:id/comments/:commentId",
  passport.authenticate("jwt", { session: false }),
  postsController.comment_delete
);

module.exports = router;
