import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary,deleteFromCloudinary} from "../utils/cloudinary.js"
import {Like} from "../models/like.model.js"; // Adjust the path based on your folder structure
import { Subscription } from "../models/subscription.model.js"


const getSearchResults = asyncHandler(async (req, res) => {
    const { query, page = 1, limit = 10 } = req.query;

    if (!query) {
        throw new ApiError(400, "Search query is required!");
    }

    // Pagination settings
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
    };

    // Search for videos by title
    const videoAggregation = Video.aggregate([
        { 
            $match: { 
                title: { $regex: query, $options: "i" }, 
                isPublished: true 
            } 
        },
        { $sort: { views: -1, createdAt: -1 } },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
            },
        },
        { $unwind: "$owner" },
        {
            $project: {
                _id: 1,
                title: 1,
                description: 1,
                thumbnail: 1,
                videoFile: 1,
                duration: 1,
                views: 1,
                createdAt: 1,
                owner: {
                    _id: 1,
                    name: 1,
                    avatar: 1,
                },
            },
        },
    ]);

    // Search for channels (users) by username or full name
    const userAggregation = User.aggregate([
        {
            $match: {
                $or: [
                    { username: { $regex: query, $options: "i" } },
                    { name: { $regex: query, $options: "i" } },
                ],
            },
        },
        {
            $project: {
                _id: 1,
                username: 1,
                name: 1,
                avatar: 1,
            },
        },
    ]);

    // Execute both searches in parallel
    const [videos, users] = await Promise.all([
        Video.aggregatePaginate(videoAggregation, options),
        User.aggregatePaginate(userAggregation, options),
    ]);

    return res.json(new ApiResponse(200, { videos, users }, "Search results retrieved successfully"));
});

// New function to get recommended videos without authentication
const getRecommendedVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    // Define the aggregation pipeline for public videos only
    const aggregation = Video.aggregate([
        { $match: { isPublished: true } }, // Only return published videos
        { $sort: { views: -1, createdAt: -1 } }, // Sort by popularity (views) and then by date
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
            },
        },
        { $unwind: "$owner" },
        {
            $project: {
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                description: 1,
                duration: 1,
                views: 1,
                createdAt: 1,
                owner: {
                    _id: 1,
                    name: 1,
                    avatar: 1
                },
            },
        },
    ]);

    // Apply pagination
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
    };

    const videos = await Video.aggregatePaginate(aggregation, options);

    return res.json(new ApiResponse(200, videos, "Recommended videos retrieved successfully"));
});

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query } = req.query;
    const userId = req.user._id; // Get the logged-in user's ID

    // Create a filter object for the aggregation
    const matchStage = { owner: new mongoose.Types.ObjectId(userId) }; // Filter by owner ID
    if (query) {
        matchStage.title = { $regex: query, $options: "i" }; // Case-insensitive title search
    }

    // Define the aggregation pipeline
    const aggregation = Video.aggregate([
        { $match: matchStage }, // Filter the videos
        { $sort: { createdAt: -1 } }, // Sort videos (newest first)
        {
            $lookup: {
                from: "users", // Join with the users collection
                localField: "owner",
                foreignField: "_id",
                as: "owner",
            },
        },
        { $unwind: "$owner" }, // Convert owner array into an object
        {
            $project: {
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                description: 1,
                duration: 1,
                views: 1,
                isPublished: 1,
                createdAt: 1,
                owner: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    avatar: 1,
                },
            },
        },
    ]);

    // Apply pagination
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
    };

    const videos = await Video.aggregatePaginate(aggregation, options);

    return res.json(new ApiResponse(200, videos, "User's videos retrieved successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const owner = req.user._id; // Extract owner from authenticated user

    if (!(title && description)) {
        throw new ApiError(401, "Title and description are required");
    }
    
    // Get video and thumbnail files from request
    const videoLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
    
    if (!videoLocalPath || !thumbnailLocalPath) {
        throw new ApiError(400, "Video file and thumbnail are required");
    }
    
    
    // Upload files to Cloudinary
    const videoFile = await uploadOnCloudinary(videoLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    
    if (!videoFile?.url || !thumbnail?.url) {
        throw new ApiError(400, "Failed to upload files to Cloudinary");
    }
    
    // Create new video
    const newVideo = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title,
        description,
        owner,
        duration: videoFile.duration || 0,
    });
    
    return res
    .json (new ApiResponse(200, newVideo, "Video published successfully"))
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user?._id; // Assuming authentication middleware is used
    const { countView = "true" } = req.query; 
   

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid Video ID format!");
    }
    const updateOperation = countView === "true" 
        ? { $inc: { views: 1 } } 
        : {};
    

    const video = await Video.findByIdAndUpdate(
        videoId,
        updateOperation, 
        { new: true }
    ).populate("owner", "fullName avatar email").lean();

    if (!video) {
        throw new ApiError(404, "Video not found!");
    }

    // Fetch likes count
    const likesCount = await Like.countDocuments({ video: videoId });
     // Fetch subscriber count for the video's owner
     const subscriberCount = await Subscription.countDocuments({ channel: video.owner._id });

    // Check if the user has liked this video
    const userLike = await Like.findOne({ video: videoId, likedBy: userId });

    // Attach likes and isLiked dynamically
    video.likes = likesCount;
    video.isLiked = !!userLike; // Convert to boolean

    return res.status(200).json(new ApiResponse(200, { video,subscriberCount }, "Got the video!"));
});




const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description, thumbnail } = req.body;

    // Check if videoId exists
    if (!videoId) {
        throw new ApiError(400, "Video ID is required!");
    }

    // Find the video by ID
    let video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found!");
    }

    // Update video details
    video = await Video.findByIdAndUpdate(
        videoId,
        { title, description, thumbnail },
        { new: true, runValidators: true } // Return updated video & validate fields
    );

    // Check if update was successful
    if (!video) {
        throw new ApiError(500, "Failed to update video!");
    }

    return res.json(new ApiResponse(200, video, "Video updated successfully"));
});


const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(400, "Video ID is required!");
    }

    // Find and delete the video
    const videoToBeDeleted = await Video.findByIdAndDelete(videoId);

    if (!videoToBeDeleted) {
        throw new ApiError(404, "Video not found!");
    }

    return res.status(200).json(new ApiResponse(200, {}, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { isPublished } = req.body;

    if (typeof isPublished !== "boolean") {
        throw new ApiError(400, "Invalid request! isPublished must be true or false.");
    }

    // Update the video publish status
    const video = await Video.findByIdAndUpdate(
        videoId,
        { isPublished },
        { new: true } // Return updated document
    );

    if (!video) {
        throw new ApiError(404, "Couldn't toggle the publish status. Video not found!");
    }

    return res.status(200).json(new ApiResponse(200, video, "Video status changed successfully"));
});

const getVideosByUsername = async (req, res) => {
    try {
      const { username } = req.params; // Get username from the route params
      if (!username) {
        return res.status(400).json({ message: "Username is required" });
      }
  
      // Find the user by username and retrieve their ObjectId
      const user = await User.findOne({ username });
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Fetch videos that belong to the user with the specified ObjectId
      const userVideos = await Video.find({ owner: user._id }).sort({ createdAt: -1 }); // Sorting by creation date
  
      if (!userVideos || userVideos.length === 0) {
        return res.status(404).json({ message: "No videos found for this user" });
      }
  
      // Return the videos found
      res.status(200).json({
        data: {
          docs: userVideos,
          count: userVideos.length, // Return the count of videos for the user
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  };


export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    getRecommendedVideos,getSearchResults,getVideosByUsername
}