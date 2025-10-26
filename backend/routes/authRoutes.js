import express from "express";
import uploadFile from "../middlewares/middleware.js";
import { registerUser, loginUser, logoutUser, checkUser, getNonce } from "../controllers/authControllers.js";

const router = express.Router();

router.post('/check-user', checkUser);
router.post('/nonce', getNonce);
router.post('/register', uploadFile, registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

export default router;

