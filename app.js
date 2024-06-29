import createHttpError from "http-errors";
import express from "express";
import path, { dirname } from "path";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import mongoose from "mongoose";

import passport from "passport";
import session from "express-session";
import passportConfig from "./config/passport.js";

import indexRouter from "./routes/index.js";
import postRouter from "./routes/post.js";
import userRouter from "./routes/user.js";
import categoryRouter from "./routes/category.js";

import "dotenv/config";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const mongoDB = process.env.MONGODB_URI;

mongoose.set("strictQuery", false);

async function main() {
  await mongoose.connect(mongoDB);
}
main().catch((err) => console.log(err));

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
}));
passportConfig(passport);
app.use(passport.session());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type")
  next();
})

app.use("/", indexRouter);
app.use("/posts", postRouter);
app.use("/users", userRouter);
app.use("/categories", categoryRouter);

app.use((req, res, next) => {
  next(createHttpError(404));
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.send({ message: err.message });
  console.log(err.message);
});

export default app;