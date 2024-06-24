import asyncHandler from "express-async-handler";
import { body, validationResult } from "express-validator";
import { isAuthor } from "./auth.js";
import passport from "passport";
import Post from "../models/post.js";
import Comment from "../models/comment.js";

const getPosts = asyncHandler(async (req, res, next) => {
  const posts = await Post.find({}).populate("user", "username").populate("categories").exec();
  res.json({ posts });
});

const getPost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.postid).populate("user", "username").populate("categories").exec();
  res.json({ post });
});

const postPost = [
  passport.authenticate("jwt", { session: false }),
  isAuthor,
  body("title")
    .trim()
    .isLength({ min: 1 }).withMessage("Post title is required.")
    .isLength({ max: 400 }).withMessage("Post title must not exceed 400 characters.")
    .escape(),
  body("subheader")
    .trim()
    .escape(),
  body("body")
    .trim()
    .isLength({ min: 1 }).withMessage("Post body is required.")
    .escape(),
  body("categories.*")
    .escape(),
  body("isPublished")
    .isBoolean()
    .escape(),
  body("publishDate")
    .optional({ values: "falsy" })
    .isDate()
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ errors: errors.array() });
      return;
    }
    const newPost = new Post({
      title: req.body.title,
      subheader: req.body.subheader,
      body: req.body.body,
      user: req.user._id,
      categories: req.body.categories,
      isPublished: req.body.isPublished,
      publishDate: req.body.publishDate ? req.body.publishDate : null,
      editDate: null,
    });
    await newPost.save();
    res.json({ post: newPost });
  }),
];

const deletePost = [
  passport.authenticate("jwt", { session: false }),
  isAuthor,
  asyncHandler(async (req, res, next) => {
    await Promise.all([
      Post.findByIdAndDelete(req.params.postid),
      Comment.deleteMany({ post: req.params.postid }),
    ]);
    res.json({ message: "done" });
  }),
];

const updatePost = [
  passport.authenticate("jwt", { session: false }),
  isAuthor,
  body("title")
    .trim()
    .isLength({ min: 1 }).withMessage("Post title is required.")
    .isLength({ max: 400 }).withMessage("Post title must not exceed 400 characters.")
    .escape(),
  body("subheader")
    .trim()
    .escape(),
  body("body")
    .trim()
    .isLength({ min: 1 }).withMessage("Post body is required.")
    .escape(),
  body("categories.*")
    .escape(),
  body("isPublished")
    .isBoolean()
    .escape(),
  body("publishDate")
    .optional({ values: "falsy" })
    .isDate()
    .escape(),
  body("editDate")
    .optional({ values: "falsy" })
    .isDate()
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ errors: errors.array() });
      return;
    }
    const updatedPost = await Post.findByIdAndUpdate(req.params.postid, {
      $set: {
        title: req.body.title,
        subheader: req.body.subheader,
        body: req.body.body,
        categories: req.body.categories,
        isPublished: req.body.isPublished,
        ...(req.body.publishDate ? { publishDate: req.body.publishDate } : {}),
        ...(req.body.editDate ? { editDate: req.body.editDate } : {}),
      },
    }, { new: true });
    res.json({ post: updatedPost });
  }),
];

export { getPosts, getPost, postPost, deletePost, updatePost };
