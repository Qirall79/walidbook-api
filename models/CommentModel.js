const mongoose = require("mongoose");
const { DateTime } = require("luxon");
const Schema = mongoose.Schema;
const commentSchema = new Schema(
  {
    text: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// To format timestamp
commentSchema.virtual("timestamp_formatted").get(function () {
  return DateTime.fromJSDate(this.timestamps).toISODate(DateTime.DATETIME_FULL);
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
