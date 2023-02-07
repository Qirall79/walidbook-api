const passport = require("passport");
const LocalStrategy = require("passport-local");
const FacebookStrategy = require("passport-facebook");
const JWTStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const User = require("../models/UserModel");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

dotenv.config();

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email: email });
        if (!user) {
          return done(null, false, { message: "User not found." });
        }
        bcrypt
          .compare(password, user.password)
          .then(() => {
            return done(null, user, { message: "Logged in successfully." });
          })
          .catch((err) => {
            return done(null, false, { message: "Password incorrect." });
          });
      } catch (err) {
        return done(err);
      }
    }
  )
);

const opts = {
  secretOrKey: process.env.JWT_SECRET || "thisissomedummysecret",
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

passport.use(
  new JWTStrategy(opts, async (payload, done) => {
    try {
      return done(null, payload);
    } catch (err) {
      return done(null, false, { message: "user not found." });
    }
  })
);
