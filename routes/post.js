import express from "express";
import { getPosts, getPost, postPost, deletePost, updatePost } from "../controllers/postController.js";
import { getComments, getComment, postComment, deleteComment, updateComment } from "../controllers/commentController.js";

const router = express.Router();

router.get("/", getPosts);

router.post("/", postPost);

router.get("/:postid", getPost);

router.delete("/:postid", deletePost);

router.put("/:postid", updatePost);

router.get("/:postid/comments", getComments);

router.post("/:postid/comments", postComment);

router.get("/:postid/comments/:commentid", getComment);

router.delete("/:postid/comments/:commentid", deleteComment);

router.put("/:postid/comments/:commentid", updateComment);

export default router;