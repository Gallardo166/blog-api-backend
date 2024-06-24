import express from "express";
import { getCategories, getCategory, postCategory, deleteCategory, updateCategory, getPostsByCategory } from "../controllers/categoryController.js";

const router = express.Router();

router.get("/", getCategories);

router.post("/", postCategory);

router.get("/:categoryid", getCategory);

router.delete("/:categoryid", deleteCategory);

router.put("/:categoryid", updateCategory);

router.get("/:categoryid/posts", getPostsByCategory)

export default router;