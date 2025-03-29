import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ✅ Get all comments for a video
const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Convert query params to numbers
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
    };

    // Check if videoId is valid
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // Aggregation pipeline
    const pipeline = [
        { $match: { video: new mongoose.Types.ObjectId(videoId) } }, // Filter by videoId
        { $sort: { createdAt: -1 } }, // Sort comments (newest first)
        {
            $lookup: {
                from: "users", // Collection name in MongoDB
                localField: "owner",
                foreignField: "_id",
                as: "owner",
            },
        },
        { $unwind: "$owner" }, // Convert owner array to object
        {
            $project: {
                _id: 1,
                content: 1, 
                createdAt: 1,
                "owner._id": 1,
                "owner.fullName": 1, // Change "name" to "fullName"
                "owner.email": 1,
                // Add any other needed fields
            },
        }
    ];

    // Execute aggregate pagination
    const comments = await Comment.aggregatePaginate(Comment.aggregate(pipeline), options);

    return res.status(200).json(new ApiResponse(200, comments, "Comments retrieved successfully"));
});

// ✅ Add a comment
const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body;
    const author = req.user._id;

    if (!content) {
        throw new ApiError(400, "Comment can't be empty");
    }

    const newComment = await Comment.create({
        content,
        video: videoId,
        owner: author,
    });

    return res.status(201).json(new ApiResponse(201, newComment, "Comment added successfully"));
});

// ✅ Update a comment
const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!content) {
        throw new ApiError(400, "Comment can't be empty");
    }

    const updatedComment = await Comment.findOneAndUpdate(
        { _id: commentId, owner: userId }, // Find the comment by ID and owner
        { content },
        { new: true, runValidators: true }
    );

    if (!updatedComment) {
        throw new ApiError(404, "Comment not found or unauthorized");
    }

    return res.status(200).json(new ApiResponse(200, updatedComment, "Comment updated successfully"));
});

// ✅ Delete a comment
const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;

    const deletedComment = await Comment.findOneAndDelete({ _id: commentId, owner: userId });

    if (!deletedComment) {
        throw new ApiError(404, "Comment not found or unauthorized");
    }

    return res.status(200).json(new ApiResponse(200, deletedComment, "Comment deleted successfully"));
});

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
};
