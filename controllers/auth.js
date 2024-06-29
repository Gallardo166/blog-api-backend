import asyncHandler from "express-async-handler";
import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import passport from "passport";

const login = [
  body("username")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Username is required.")
    .escape(),
  body("password")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Password is required.")
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ message: errors.array() });
      return;
    }
    next();
  }),

  passport.authenticate("local", { session: false, failureMessage: "Not authorized." }),

  (req, res, next) => {
    jwt.sign(
      { userId: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
      (err, token) => {
        if (err) return next(err);
        res.json({ token });
      }
    );
  },
];

const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.json({ message: "done" });
  });
}

const isAuthor = (req, res, next) => {
  if (req.isAuthenticated() && req.user.status === "author") {
    next();
    return;
  }
  res.status(401).json({ message: "You are not an author." });
}

export { login, logout, isAuthor }