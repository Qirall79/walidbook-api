const passport = require("passport");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const hashPassword = require("../utils/hashPassword");
const fs = require("fs");
const User = require("../models/UserModel");
const { body, validationResult } = require("express-validator");
const path = require("path");

dotenv.config();

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

exports.signup = [
  body("first_name")
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage("First name is required")
    .isAlpha()
    .withMessage("First name must contain only alphabetical characters."),
  body("last_name")
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage("last name is required")
    .isAlpha()
    .withMessage("last name must contain only alphabetical characters."),
  body("email")
    .trim()
    .isEmail()
    .withMessage("Invalid email.")
    .custom(async (email) => {
      const storedEmail = await User.findOne({ email });
      if (storedEmail) throw new Error("Email already exists.");
      return true;
    }),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must contain at least 8 characters."),
  body("password_confirmation")
    .exists()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords don't match.");
      }
      return true;
    }),
  async (req, res, next) => {
    const errors = validationResult(req);
    const { first_name, last_name, email, password } = req.body;
    const user = new User({
      firstName: first_name,
      lastName: last_name,
      email,
      password: hashPassword(password),
      friends: [],
      receivedRequests: [],
      sentRequests: [],
      image: res.locals.imageDetails.url,
    });

    if (!errors.isEmpty()) {
      res.status(500).json({
        user,
        errors: errors.array(),
      });
      return;
    }
    user
      .save()
      .then(() => {
        // Automatically login user after signup
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
      })
      .catch((err) => next(err));
  },
];
