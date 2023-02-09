const express = require("express");
const router = express.Router();
const passport = require("passport");
const usersController = require("../controllers/usersController");

// Get current user
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  usersController.currentUser_get
);

// Get specific user
router.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  usersController.user_get
);

// Handle friend request
router.post(
  "/:receiverId",
  passport.authenticate("jwt", { session: false }),
  usersController.friend_post
);

// Handle response to friend request
router.put(
  "/:senderId",
  passport.authenticate("jwt", { session: false }),
  usersController.friend_update
);

// Delete friend
router.delete(
  "/:userId/:friendId",
  passport.authenticate("jwt", { session: false }),
  usersController.friend_delete
);

module.exports = router;
