import { Router } from 'express';
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();

    
router
    .route("/c/:channelId")
    .get(getSubscribedChannels)
    .post(verifyJWT,toggleSubscription);

    router.route("/c/:channelId/subscribers").get(getUserChannelSubscribers);

export default router