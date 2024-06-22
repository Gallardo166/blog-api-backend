import asyncHandler from "express-async-handler";
import { body, validationResult } from "express-validator";
import Post from "../models/post.js";
import User from "../models/user.js";
import Comment from "../models/comment.js";

const getPosts = asyncHandler(async (req, res, next) => {
  const posts = await Post.find({}).populate("user").exec();
  res.json({ posts });
});

const getPost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.postid).populate("user").exec();
  res.json({ post });
});

const postPost = [
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
  body("isPublished")
    .isBoolean(),
  body("publishDate")
    .optional({ values: "falsy" })
    .isDate(),

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
      user: req.body.userid,
      isPublished: req.body.isPublished,
      publishDate: req.body.publishDate ? req.body.publishDate : null,
      editDate: null,
    });
    await newPost.save();
    res.json({ post: newPost });
  }),
];

const deletePost = asyncHandler(async (req, res, next) => {
  await Promise.all([
    Post.findByIdAndDelete(req.params.postid),
    Comment.deleteMany({ post: req.params.postid }),
  ]);
  res.json({ message: "done" });
});

const updatePost = [
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
  body("isPublished")
    .isBoolean(),
  body("publishDate")
    .optional({ values: "falsy" })
    .isDate(),
  body("editDate")
    .optional({ values: "falsy" })
    .isDate(),

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
        isPublished: req.body.isPublished,
        ...(req.body.publishDate ? { publishDate: req.body.publishDate } : {}),
        ...(req.body.editDate ? { editDate: req.body.editDate } : {}),
      },
    }, { new: true });
    res.json({ post: updatedPost });
  }),
];

export { getPosts, getPost, postPost, deletePost, updatePost };
