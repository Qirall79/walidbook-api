const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true },
  password: { type: String },
  image: {
    type: String,
  },
  friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
  receivedRequests: [{ type: Schema.Types.ObjectId, ref: "User" }],
  sentRequests: [{ type: Schema.Types.ObjectId, ref: "User" }],
});

const User = mongoose.model("User", userSchema);

module.exports = User;
