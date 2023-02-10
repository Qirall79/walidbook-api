const passport = require("passport");
const LocalStrategy = require("passport-local");
const FacebookStrategy = require("passport-facebook");
const JWTStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const User = require("../models/UserModel");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

dotenv.config();

// Configure Passport authenticated session persistence.
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
          return done(null, false, { message: "User not found." });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, {
            message: "Incorrect Password.",
          });
        }
        return done(null, user, { message: "Logged in successfully" });
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

// JSON Web Token Strategy
passport.use(
  new JWTStrategy(opts, async (payload, done) => {
    try {
      return done(null, payload);
    } catch (err) {
      return done(null, false, { message: "user not found." });
    }
  })
);

// Facebook Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env["FACEBOOK_APP_ID"] || "700932798430218",
      clientSecret:
        process.env["FACEBOOK_APP_SECRET"] ||
        "c2c8f1d2ae712cd3430ba1bae11ef0a8",
      callbackURL: "/auth/login/facebook/callback",
      profileFields: ["id", "displayName", "photos", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await User.findOne({ facebookId: profile.id });

        if (!user) {
          const newUser = new User({
            facebookId: profile.id,
            firstName: profile.displayName.split(" ")[0],
            lastName: profile.displayName.split(" ")[1],
            email: profile.email || "",
            image: profile.photos[0].value || "",
          });

          const savedUser = await newUser.save();

          return done(null, savedUser);
        }

        return done(null, user);
      } catch (err) {
        console.log(err);
        return done(null, false);
      }
    }
  )
);
