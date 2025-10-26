import express from "express";
import { User } from "../models/userModel.js";
import TryCatch from "../utils/TryCatch.js";
import { isAuth } from "../middlewares/isAuth.js";
import { 
    myProfile, 
    userProfile, 
    followandUnfollowUser, 
    updateProfile,
    userFollowerandFollowing,
    // getAllUsers, // UNUSED - Commented out in controller
    getRecommendedUsers
} from "../controllers/userControllers.js";


const router = express.Router();

router.get("/me", isAuth, myProfile);
router.get("/recommended", isAuth, getRecommendedUsers);
router.get("/:id", isAuth, userProfile);
router.put("/update-profile", isAuth, updateProfile);
router.post("/:id/follow", isAuth, followandUnfollowUser);
router.get("/:id/followdata", isAuth, userFollowerandFollowing);
// router.get("/all", isAuth, getAllUsers); // UNUSED - No frontend calls this endpoint




export default router;


