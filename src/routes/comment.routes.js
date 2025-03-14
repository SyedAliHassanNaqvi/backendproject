import { Router } from 'express';
import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment,
} from "../controllers/comment.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import multer from "multer";
const upload = multer();
//This error occurs because your server is not correctly parsing multipart/form-data when you send a PATCH request with FormData. The key issue is that Express does not parse multipart/form-data automatically unless you use a middleware like multer or express.urlencoded().

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/:videoId").get(getVideoComments).post(upload.none(),addComment);
router.route("/c/:commentId").delete(deleteComment).patch(upload.none(),updateComment);

export default router