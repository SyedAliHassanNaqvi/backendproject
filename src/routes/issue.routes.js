import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getNearbyIssues,reportIssue, getIssues, updateIssue } from "../controllers/issue.controller.js";
import multer from "multer";

const upload = multer({ dest: "uploads/" }); // or use multer storage for Cloudinary


const router = express.Router();

router.post("/",  upload.single("media"),verifyJWT, reportIssue);
router.get("/", verifyJWT, getIssues);
router.patch("/:id", verifyJWT, updateIssue);
router.get("/nearby", getNearbyIssues);

export default router;