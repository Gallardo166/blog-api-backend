import asyncHandler from "express-async-handler";
import { body, validationResult } from "express-validator";
import Comment from "../models/comment.js";
import passport from "passport";
import { isAuthor } from "./auth.js";

const getComments = asyncHandler(async (req, res, next) => {
  const comments = await Comment.find({ post: req.params.postid }).sort({ date: -1 }).populate("user", "username").exec();
  res.json({ comments });
});

const getComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.commentid).populate("user", "username").exec();
  res.json({ comment });
});

const postComment = [
  passport.authenticate("jwt", { session: false }),
  body("body")
    .trim()
    .isLength({ min: 1 }).withMessage("Comment body is required")
    .isLength({ max: 550 }).withMessage("Comment must not exceed 550 characters.")
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ errors: errors.array() });
      return;
    }
    const newComment = new Comment({
      body: req.body.body,
      user: req.user._id,
      date: Date.now(),
      post: req.params.postid,
    });
    await newComment.save();
    res.json({ comment: newComment });
  }),
];

const deleteComment = [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(async (req, res, next) => {
    const comment = await Comment.findById(req.params.commentid);
    if (comment.user.toString() === req.user._id.toString() || req.user.status === "author") await Comment.deleteOne({ _id: req.params.commentid });
    res.json({ message: "done" });
  })
];

const updateComment = [
  passport.authenticate("jwt", { session: false }),
  isAuthor,
  body("body")
    .trim()
    .isLength({ min: 1 }).withMessage("Comment body is required")
    .isLength({ max: 550 }).withMessage("Comment must not exceed 550 characters.")
    .escape(),
  
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ errors: errors.array() });
      return;
    }
    const updatedComment = await Comment.findByIdAndUpdate(req.params.commentid, {
      $set: {
        body: req.body.body,
      }
    }, { new: true });
    res.json({ comment: updatedComment });
  }),
]

export { getComments, getComment, postComment, deleteComment, updateComment }
