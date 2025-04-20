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
  const { userId } = req.params;

  const tweets = await Tweet.find({ owner: userId })
    .populate("owner", "username fullName avatar")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "User tweets fetched successfully"));
});


const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;
  const owner = req.user._id;

  if (!content) {
    throw new ApiError(400, "Tweet content is required");
  }

  // Ensure tweet belongs to the logged-in user
  const ownerCheck = await Tweet.findOne({ _id: tweetId, owner });
  if (!ownerCheck) {
    throw new ApiError(403, "You are not authorized to update this tweet");
  }

  // Update and populate owner details
  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    { content },
    { new: true }
  ).populate("owner", "username fullName avatar");

  if (!updatedTweet) {
    throw new ApiError(404, "Tweet not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"));
});


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
const getAllTweets = asyncHandler(async (req, res) => {
  // Optional pagination parameters
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Find all tweets, sort by creation date (newest first)
  const tweets = await Tweet.find()
    .populate("owner", "username fullName avatar") // Populate owner details
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Get total count for pagination info
  const totalTweets = await Tweet.countDocuments();

  return res.status(200).json(
    new ApiResponse(
      200, 
      {
        tweets,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalTweets / limit),
          totalTweets
        }
      }, 
      "Tweets fetched successfully"
    )
  );
});

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
    getAllTweets,
}
