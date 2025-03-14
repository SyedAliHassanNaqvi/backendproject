import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    // 1. Get the channel id from the request params
    // 2. Check if the channel id is valid
    // 3. Get the total subscribers of the channel
    // 4. Get the total videos uploaded by the channel
    // 5. Get the total views on all the videos uploaded by the channel
    // 6. Get the total likes on all the videos uploaded by the channel
    // 7. Return the channel stats
    // 8. Handle errors
    const channelId = req.user._id;  // ✅ Get channel ID from logged-in user
    if (!mongoose.isValidObjectId(channelId)) {
      throw new ApiError(400, "Invalid channel id");
  }

  const totalSubscribers = await Subscription.countDocuments({ channel: channelId });
  const totalVideos = await Video.countDocuments({ channel: channelId });

  const totalViews = (await Video.aggregate([
      { $match: { channel: new mongoose.Types.ObjectId(channelId) } },  
      { $group: { _id: null, totalViews: { $sum: "$views" } } }
  ]))[0]?.totalViews || 0;  

  const totalLikes = (await Like.aggregate([
      { 
          $match: { 
              video: { 
                  $in: (await Video.find({ channel: channelId }).distinct("_id"))
                        .map(id => new mongoose.Types.ObjectId(id))  
              }
          } 
      },
      { $group: { _id: null, totalLikes: { $sum: 1 } } }
  ]))[0]?.totalLikes || 0;  

  return res.status(200).json(new ApiResponse(200, { totalSubscribers, totalVideos, totalViews, totalLikes }, "Channel stats fetched successfully"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const channelId = req.user._id;  // ✅ Get channel ID from logged-in user

  if (!mongoose.isValidObjectId(channelId)) {
      throw new ApiError(400, "Invalid channel id");
  }

  const videos = await Video.find({ channel: channelId }).populate("channel", "username");
  return res.status(200).json(new ApiResponse(200, videos, "Channel videos fetched successfully"));
});

export { getChannelStats, getChannelVideos };