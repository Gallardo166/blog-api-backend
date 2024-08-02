import express from "express";
import { getUsers, getUser, postUser, deleteUser, updateUser, getCommentsByUser } from "../controllers/userController.js";

const router = express.Router();

router.get("/", getUsers);

router.post("/", postUser);

router.get("/user", getUser);

router.delete("/:userid", deleteUser);

router.put("/:userid", updateUser);

router.get("/:userid/comments", getCommentsByUser);

export default router;