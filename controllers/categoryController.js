import asyncHandler from "express-async-handler";
import { body, validationResult } from "express-validator";
import Category from "../models/category.js";
import Post from "../models/post.js";
import passport from "passport";
import { isAuthor } from "./auth.js";

const getCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find({}).exec();
  res.json({ categories });
});

const getCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.categoryid).exec();
  res.json({ category });
});

const postCategory = [
  passport.authenticate("jwt", { session: false }),
  isAuthor,
  body("name")
    .trim()
    .isLength({ min: 1 }).withMessage("Category name is required.")
    .escape(),
  
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ errors: errors.array() });
      return;
    }
    const newCategory = new Category({ name: req.body.name });
    await newCategory.save();
    res.json({ category: newCategory });
  }),
];

const deleteCategory = [
  passport.authenticate("jwt", { session: false }),
  isAuthor,
  
  asyncHandler(async (req, res, next) => {
    await Promise.all([
      Post.deleteMany({ category: req.params.categoryid }, { $pull: { categories: req.params.categoryid } }).exec(),
      Category.findByIdAndDelete(req.params.categoryid),
    ]);
    res.json({ message: "done" });
  }),
];

const updateCategory = [
  passport.authenticate("jwt", { session: false }),
  isAuthor,

  body("name")
    .trim()
    .isLength({ min: 1 }).withMessage("Category name is required.")
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ errors: errors.array() });
      return;
    }
    const updatedCategory = await Category.findByIdAndUpdate(req.params.categoryid, {
      $set: { name: req.body.name },
    }, { new: true });
    res.json({ category: updatedCategory });
  }),
];

const getPostsByCategory = asyncHandler(async (req, res, next) => {
  const posts = await Post.find({ categories: req.params.categoryid }).populate("user", "username").populate("categories").exec();
  res.json({ posts });
});

export { getCategories, getCategory, postCategory, deleteCategory, updateCategory, getPostsByCategory }