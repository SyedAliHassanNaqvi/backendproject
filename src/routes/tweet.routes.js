import { Router } from 'express';
import multer from 'multer';
const upload = multer();
import {
    createTweet,
    deleteTweet,
    getAllTweets,
    getUserTweets,
    updateTweet,
} from "../controllers/tweet.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/").post(upload.none(),createTweet);
router.route("/user/:userId").get(getUserTweets); //:userId is a route parameter (a dynamic part of the URL).
router.route("/:tweetId").patch(upload.none(),updateTweet).delete(deleteTweet);
router.route("/").get(getAllTweets); // This route will handle GET requests to /api/tweets and call the getAllTweets function

export default router