import mongoose from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Toggle Like for Video
const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const likedBy = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid Video ID");
    }

    const existingLike = await Like.findOne({ video: videoId, likedBy });

    if (existingLike) {
        await existingLike.deleteOne();
        return res.status(200).json(new ApiResponse(200, [], "Video unliked successfully"));
    }

    const newLike = await Like.create({ video: videoId, likedBy });
    return res.status(201).json(new ApiResponse(201, newLike, "Video liked successfully"));
});

// Toggle Like for Comment
const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const likedBy = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid Comment ID");
    }

    const existingLike = await Like.findOne({ comment: commentId, likedBy });

    if (existingLike) {
        await existingLike.deleteOne();
        return res.status(200).json(new ApiResponse(200, [], "Comment unliked successfully"));
    }

    const newLike = await Like.create({ comment: commentId, likedBy });
    return res.status(201).json(new ApiResponse(201, newLike, "Comment liked successfully"));
});

// Get Liked Videos
const getLikedVideos = asyncHandler(async (req, res) => {
    const likedBy = req.user._id;
    const likedVideos = await Like.find({ likedBy }).populate("video");

    if (!likedVideos.length) {
        return res.status(404).json(new ApiResponse(404, [], "No liked videos found"));
    }

    return res.status(200).json(new ApiResponse(200, likedVideos, "Liked videos retrieved successfully"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    const likedBy = req.user._id
    const tweet = tweetId;
    if(!tweet){
      throw new ApiError(404, "Tweet not found")
    }
    const newLike = await Like.create({
      tweet,
      likedBy
    })
    return res.status(201).json(new ApiResponse(201, newLike, "Tweet liked successfully"))
}
)


export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}