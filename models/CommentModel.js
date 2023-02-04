const mongoose = require("mongoose");
const { DateTime } = require("luxon");
const Schema = mongoose.Schema;
const commentSchema = new Schema(
  {
    body: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  },
  { timestamps: true }
);

// To format timestamp
commentSchema.virtual("timestamp_formatted").get(function () {
  return DateTime.fromJSDate(this.updatedAt).toFormat("DD HH:mm");
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
