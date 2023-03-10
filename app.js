const express = require("express");
const createError = require("http-errors");
const logger = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const authController = require("./controllers/authController");
const postsController = require("./controllers/postsController");
const multer = require("multer");
const { upload } = require("./service/uploadService");
const uploadImage = require("./controllers/uploadController");
const usersController = require("./controllers/usersController");
const passport = require("passport");

// Passport setup
require("./middleware/passport");

// Import routes
const indexRouter = require("./routes/index");
const authRouter = require("./routes/auth");
const postsRouter = require("./routes/posts");
const usersRouter = require("./routes/users");

// Get environment variables
dotenv.config();

// App setup
const app = express();
const port = process.env.PORT || "5000";

// Database setup
const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://walid:walid123@cluster0.hqkhs9t.mongodb.net/walidbook?retryWrites=true&w=majority";

const connectDb = async () => {
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

try {
  connectDb();
} catch (err) {
  console.log(err);
}

// Basic config
app.use(helmet());
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// Routes requiring upload files handler
app.post(
  "/auth/signup",
  upload.single("image"),
  uploadImage,
  authController.signup
);
app.post(
  "/auth/update",
  passport.authenticate("jwt", { session: false }),
  upload.single("image"),
  uploadImage,
  authController.user_update
);
app.post(
  "/posts",
  passport.authenticate("jwt", { session: false }),
  upload.single("image"),
  uploadImage,
  postsController.posts_post
);

// Routes
app.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  usersController.users_get
);
app.use("/", indexRouter);
app.use("/user", usersRouter);
app.use("/posts", postsRouter);
app.use("/auth", authRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // render the error page
  console.log(err);
  res.status(err.status || 500).json({ message: err.message });
  return;
});
// Listen for requests
app.listen(port, () => {
  console.log("Listening on port " + port);
});
