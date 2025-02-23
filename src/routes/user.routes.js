import { Router } from "express";
import {logoutUser,loginUser,registerUser,refreshAccessToken, changeCurrentPassword, getCurrentUser,updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory} from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"; // Ensure correct path

//post will call the registerUser method on /register

const router = Router(); 
//in post there are two functions separated by comma, the first function is middleware
//that's why we write next at the end of the middleware so that we can move to the 2nd function of post which is after comma like first fun in this is upload(which is a middleware) and second is registerUser
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1
    },
    {
      name: "coverImage",
      maxCount:1
    }
  ]),
  registerUser)

router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT,changeCurrentPassword)
router.route("/current-user").get(verifyJWT,getCurrentUser) //we used get request because the user is not sending anything it's just recieving 
router.route("/update-account").patch(verifyJWT,updateAccountDetails)
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)
router.route("/cover-image").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage)
//cz of params we use /c/:
router.route("/c/:username").get(verifyJWT,getUserChannelProfile)
router.route("/history").get(verifyJWT, getWatchHistory)



export default router;