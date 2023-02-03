const { body, validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");
const Post = require("../models/PostModel");
const Comment = require("../models/CommentModel");

exports.posts_get = async (req, res, next) => {
  const posts = await Post.find();

  res.json({ posts });
};

exports.post_get = async (req, res, next) => {
  const postId = req.params.id;

  const [post, comments] = await Promise.all([
    Post.findById(postId).populate("author"),
    Comment.find({ post: postId }),
  ]);

  if (!post) {
    return res.status(404).json({ message: "Post not found." });
  }
  res.json({ post, comments });
};
exports.posts_post = [
  body("description")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Description required."),
  body("author").trim().isLength({ min: 1 }).withMessage("author required."),
  async (req, res, next) => {
    const errors = validationResult(req);
    const { description, author } = req.body;
    const post = new Post({
      description,
      author,
      likes: {},
      image: {
        data: fs.readFileSync(
          path.join(
            __dirname,
            "../public/uploads/",
            req.file ? req.file.filename : "place_holder_img"
          )
        ),
        contentType: "images/png",
      },
    });

    if (!errors.isEmpty()) {
      res.status(500).json({ post, errors: errors.array() });
      return;
    }
    post.save((err) => {
      if (err) {
        return next(err);
      }
      return res.json({ post });
    });
  },
];
