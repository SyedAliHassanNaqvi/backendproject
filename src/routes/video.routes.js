import { Router } from "express";
import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
    getRecommendedVideos,
    getSearchResults,getVideosByUsername
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";


const router = Router();


// Within your route definitions:
router.get("/search", getSearchResults);

// Public route for recommended videos - no authentication required
router.route("/recommended").get(getRecommendedVideos);

// Public search route for both videos & channels
router.route("/search").get(getSearchResults);

router.route("/user/:username").get(getVideosByUsername); // Public route to get videos uploaded by a user

router.use(verifyJWT);

router
    .route("/")
    .get(getAllVideos)
    .post(
        upload.fields([
            { name: "videoFile", maxCount: 1 },
            { name: "thumbnail", maxCount: 1 },
        ]),
        publishAVideo
    );

router
    .route("/:videoId")
    .get(getVideoById)
    .delete(deleteVideo)
    .patch(upload.single("thumbnail"), updateVideo);

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router;