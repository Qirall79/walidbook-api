const express = require("express");
const logger = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Passport setup
require("./middleware/passport");

// Import routes
const indexRouter = require("./routes/index");
const authRouter = require("./routes/auth");
const postsRouter = require("./routes/posts");

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
app.use("/auth", authRouter);
app.use("/posts", postsRouter);

// Listen for requests
app.listen(port, () => {
  console.log("Listening on port " + port);
});
