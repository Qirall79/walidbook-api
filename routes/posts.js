const express = require("express");
const postsController = require("../controllers/postsController");
const router = express.Router();

router.get("/", postsController.posts_get);

module.exports = router;
