const passport = require("passport");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

exports.user_get = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({
        error: err,
      });
    }

    res.json(user);
  })(req, res, next);
};

exports.login = (req, res, next) => {
  passport.authenticate(
    "local",
    { session: false },
    async (err, user, info) => {
      try {
        if (err) {
          return res.status(500).json({ err });
        }
        if (!user) {
          return res.status(404).json({
            message: info.message,
          });
        }
        req.login(user, { session: false }, (err) => {
          if (err) {
            res.status(404).json({ error: err });
          }
          const body = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
          };
          const token = jwt.sign(
            { user: body },
            process.env.JWT_SECRET || "thisissomedummysecret"
          );
          res.json({
            token,
          });
        });
      } catch (err) {
        res.status(404).json(err);
      }
    }
  )(req, res, next);
};
