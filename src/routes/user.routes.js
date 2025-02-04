import { Router } from "express";
import {logoutUser,loginUser,registerUser,refreshAccessToken} from "../controllers/user.controller.js"
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


export default router;