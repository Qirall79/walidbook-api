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
const upload = multer({ dest: path.join(__dirname, "/public/uploads") });

// Passport setup
require("./middleware/passport");

// Import routes
const indexRouter = require("./routes/index");
const authRouter = require("./routes/auth");
const postsRouter = require("./routes/posts");
const passport = require("passport");

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

// Routes
app.use("/", indexRouter);
app.post("/auth/signup", upload.single("image"), authController.signup);
app.post(
  "/posts",
  passport.authenticate("jwt", { session: false }),
  upload.single("image"),
  postsController.posts_post
);
app.use("/posts", postsRouter);
app.use("/auth", authRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // render the error page
  res.status(err.status || 500).json({ message: err.message });
  return;
});
// Listen for requests
app.listen(port, () => {
  console.log("Listening on port " + port);
});
