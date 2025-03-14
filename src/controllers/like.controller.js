import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    const likedBy = req.user._id
    const video = videoId;
    if(!video){
      throw new ApiError(404, "Video not found")
    }
    const existingLike = await Like.findOne({video, likedBy})
    if(existingLike){
      await existingLike.remove()
      return res.status(200).json(new ApiResponse(200, [], "Video unliked successfully"))
    }
    const newLike = await Like.create({
      video,
      likedBy
    })
    return res.status(201).json(new ApiResponse(201, newLike, "Video liked successfully"))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    const likedBy = req.user._id
    const comment = commentId;
    if(!comment){
      throw new ApiError(404, "Comment not found")
    }
    const newLike = await Like.create({
      comment,
      likedBy
    })
    return res.status(201).json(new ApiResponse(201, newLike, "Comment liked successfully"))

})

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

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const likedBy = req.user._id
    const likedVideos = await Like.find({likedBy}).populate("video")
    if (!likedVideos.length) {
      return res.status(404).json(new ApiResponse(404, [], "No liked videos found"));
  }
    return res.status(200).json(new ApiResponse(200, likedVideos, "Liked videos retrieved successfully"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}