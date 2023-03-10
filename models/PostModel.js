const mongoose = require("mongoose");
const { DateTime } = require("luxon");
const Schema = mongoose.Schema;
const postSchema = new Schema(
  {
    description: String,
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    likes: {
      type: Map,
      of: String,
    },
    image: {
      type: String,
    },
    timestamp: String,
  },
  { timestamps: true }
);

// To format timestamp
postSchema.virtual("timestamp_formatted").get(function () {
  return DateTime.fromJSDate(this.createdAt).toFormat("DD HH:mm");
});

postSchema.virtual("url").get(function () {
  return "/posts/" + this._id;
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
