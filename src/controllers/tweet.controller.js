import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body
    const owner = req.user._id
    if(!content){
      throw new ApiError(400, "Tweet content is required")
    }
    const tweet = await Tweet.create({
      content,
      owner
    })
    return res.status(201).json(new ApiResponse(201, tweet, "Tweet created successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    // Get userId from request parameters (NOT from req.user._id)
    //const { userId } = req.user._id; is wrong because we are getting userId from the request parameters and You're trying to destructure userId from _id, which is incorrect. const { userId } = req.user._id; can be correct.
    const {userId} = req.params
    const tweets = await Tweet.find({owner: userId})
    return res.status(200).json(new ApiResponse(200, tweets, "User tweets fetched successfully"))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params
    const {content} = req.body
    const owner = req.user._id
    if(!content){
      throw new ApiError(400, "Tweet content is required")
    }
    const ownerCheck = await Tweet.findOne({_id: tweetId, owner})
    if(!ownerCheck){
      throw new ApiError(403, "You are not authorized to update this tweet")
    }
    const updatedTweet = await Tweet.findByIdAndUpdate(tweetId, {content}, {new: true})
    if(!updatedTweet){
      throw new ApiError(404, "Tweet not found")
    }
    return res.status(200).json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"))
    
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params
    const owner = req.user._id
    const ownerCheck = await Tweet.findOne({_id: tweetId, owner})
    if(!ownerCheck){
      throw new ApiError(403, "You are not authorized to delete this tweet")
    }
    const deletedTweet = await Tweet.findByIdAndDelete(tweetId)
    if(!deletedTweet){
      throw new ApiError(404, "Tweet not found")
    }
    return res.status(200).json(new ApiResponse(200, deletedTweet, "Tweet deleted successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
