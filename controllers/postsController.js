const { body, validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");
const Post = require("../models/PostModel");
const User = require("../models/UserModel");
const Comment = require("../models/CommentModel");
const { DateTime } = require("luxon");

// Posts get requests handlers
exports.posts_get = async (req, res, next) => {
  const user = req.params.id;
  const [allPosts, userData, allComments] = await Promise.all([
    Post.find().populate("author"),
    User.findById(user),
    Comment.find().populate("author"),
  ]);
  const userPosts = allPosts.filter((post) => post.author?._id == user);
  const friendPosts = allPosts.filter((post) =>
    userData.friends.includes(post.author?._id)
  );

  const comments = allComments.filter(
    (com) => userPosts.includes(com.post) || friendPosts.includes(com.post)
  );

  res.json({ userPosts, friendPosts, comments });
};

// Posts post requests handlers
exports.posts_post = [
  body("description")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Description required."),
  body("author").trim().isLength({ min: 1 }).withMessage("author required."),
  async (req, res, next) => {
    const errors = validationResult(req);
    const { description, author } = req.body;
    const timestamp = DateTime.fromJSDate(new Date()).toFormat("DD HH:mm");
    const post = new Post({
      description,
      author,
      likes: {},
      image: res.locals.imageDetails?.url,
      timestamp,
    });

    if (!errors.isEmpty()) {
      res.status(500).json({ post, errors: errors.array() });
      return;
    }
    post.save((err, result) => {
      if (err) {
        console.log(err);
        return next(err);
      }
      return res.json({ result });
    });
  },
];

// Update post (likes handler)
exports.post_update = async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  const { author } = req.body;
  if (!post) {
    return res.status(404).json({ message: "Post not found." });
  }

  if (post.likes.get(author)) {
    post.likes.delete(author);
  } else {
    post.likes.set(author, true);
  }
  const updatedPost = await Post.findByIdAndUpdate(req.params.id, {
    likes: post.likes,
  });

  res.json({ post: updatedPost });
};

// Post delete
exports.post_delete = async (req, res, next) => {
  try {
    // Delete comments related to post
    await Comment.find({ post: req.params.id }).deleteMany();
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.json({ message: "Already deleted." });
    }
    res.json({ message: "Deleted successfully." });
  } catch (err) {
    return next(err);
  }
};

// comments handlers
exports.post_comment = async (req, res, next) => {
  try {
    const { body, author } = req.body;

    if (!body) {
      return res.status(500).json({ message: "Comment body doesn't exist." });
    }
    const comment = new Comment({
      body,
      author,
      post: req.params.id,
    });

    comment
      .save()
      .then((comment) => {
        res.json({ comment });
      })
      .catch((err) => next(err));
  } catch (err) {
    return next(err);
  }
};

exports.comment_delete = async (req, res, next) => {
  try {
    const id = req.params.commentId;

    await Comment.findByIdAndDelete(id);
    res.json({ message: "Comment deleted successfully." });
  } catch (err) {
    return next(err);
  }
};
