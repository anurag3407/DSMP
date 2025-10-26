import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import { 
  deletePost, 
  getAllPosts, 
  newPost, 
  likeAndUnlikePost, 
  commentOnPost 
} from "../controllers/postController.js";
import uploadFile from "../middlewares/middleware.js";


const router = express.Router();

router.post("/new", isAuth, uploadFile, newPost);

router.delete("/:id", isAuth, deletePost);

router.get("/all", isAuth, getAllPosts);

router.post("/:id/like", isAuth, likeAndUnlikePost);

router.post("/:id/comment", isAuth, commentOnPost);

export default router;