import express from "express";
import { getUsers, getUser, postUser, deleteUser, updateUser } from "../controllers/userController.js";

const router = express.Router();

router.get("/", getUsers);

router.post("/", postUser);

router.get("/user", getUser);

router.delete("/:userid", deleteUser);

router.put("/:userid", updateUser);

export default router;