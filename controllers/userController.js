import asyncHandler from "express-async-handler";
import { body, validationResult } from "express-validator";
import User from "../models/user.js";
import bcrypt from "bcryptjs";
import passport from "passport";

const getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find({}).exec();
  res.json({ users });
});

const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.userid).exec();
  res.json({ user });
});

const postUser = [
  body("username")
    .trim()
    .isLength({ min: 1 }).withMessage("Username is required.")
    .isLength({ max: 100 }).withMessage("Username must not exceed 100 characters.")
    .escape(),
  body("password")
    .trim()
    .isLength({ min: 1 }).withMessage("Password is required.")
    .isLength({ min: 8 }).withMessage("Password must exceed 8 characters.")
    .escape(),
  
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ errors: errors.array() });
      return;
    }
    bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
      if (err) return next(err);
      const newUser = new User({
        username: req.body.username,
        password: hashedPassword,
        status: "guest",
      });
      await newUser.save();
      res.json({ user: newUser });
    });
  }),
];

const deleteUser = [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(async (req, res, next) => {
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: "done" });
  })
];

const updateUser = [
  passport.authenticate("jwt", { session: false }),
  body("username")
    .trim()
    .isLength({ min: 1 }).withMessage("Username is required.")
    .isLength({ max: 100 }).withMessage("Username must not exceed 100 characters.")
    .escape(),
  body("password")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ min: 1 }).withMessage("Password is required.")
    .isLength({ min: 8 }).withMessage("Password must exceed 8 characters.")
    .escape(),
  body("status")
    .optional({ values: "falsy" })
    .custom((value) => {
      if (value !== "guest" && value !== "user" && value !== "author") {
        throw new Error("Invalid status - must be 'guest', 'user' or 'author'.");
      }
      return true;
    }),
  
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ errors: errors.array() });
      return;
    }
    if (!req.body.password) {
      const updatedUser = await User.findByIdAndUpdate(req.user._id, {
        $set: { username: req.body.username },
        ...(req.body.status ? { status: req.body.status } : {}),
      }, { new: true });
      res.json({ user: updatedUser });
    }
    bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
      if (err) return next(err);
      const updatedUser = await User.findByIdAndUpdate(req.params.userid, {
        $set: {
          username: req.body.username,
          password: hashedPassword,
          ...(req.body.status ? { status: req.body.status } : {}),
        }
      }, { new: true });
      res.json({ user: updatedUser });
    });
  }),
];

export { getUsers, getUser, postUser, deleteUser, updateUser }