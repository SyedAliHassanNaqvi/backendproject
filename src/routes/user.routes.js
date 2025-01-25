import { Router } from "express";
import {registerUser} from "../controllers/user.controller.js"

const router = Router(); 
//post will call the registerUzer method on /register
router.route("/register").post(registerUser)


export default router;