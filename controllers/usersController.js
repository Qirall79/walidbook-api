const User = require("../models/UserModel");
const passport = require("passport");

exports.currentUser_get = (req, res, next) => {
  passport.authenticate(
    "jwt",
    { session: false },
    async (err, payload, info) => {
      if (err) {
        return next(err);
      }
      if (!payload) {
        return res.status(500).json({ message: info.message });
      }
      const currentUser = await User.findById(payload.user._id)
        .populate("friends")
        .populate("receivedRequests")
        .populate("sentRequests");
      res.json({ user: currentUser });
    }
  )(req, res, next);
};

exports.user_get = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("friends")
      .populate("receivedRequests")
      .populate("sentRequests");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json({ user });
  } catch (err) {
    return next(err);
  }
};
