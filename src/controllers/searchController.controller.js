import {Video} from "../models/video.model.js";
import {User} from "../models/user.model.js";
import SearchQuery from "../models/searchQuery.model.js";

import { levenshteinDistance, areSimilar, findSimilarWords } from "../utils/searchUtils.js";

// Get search results
export const getSearchResults = async (req, res) => {
  let searchLog = null;

  try {
    const { query, type = "all", sort = "relevance", limit = 20 } = req.query;

    if (!query) {
      return res.status(400).json({ success: false, message: "Search query is required" });
    }

    // Log search query
    searchLog = new SearchQuery({
      query,
      type,
      user: req.user ? req.user._id : null,
      clientIP: req.ip,
      userAgent: req.headers["user-agent"],
    });

    await searchLog.save();

    const searchTerms = query.toLowerCase().split(/\s+/);
    const searchPattern = new RegExp(searchTerms.join("|"), "i");

    const searchResults = {
      videos: [],
      users: [],
      searchId: searchLog._id,
    };

    // Search Videos
    if (type === "all" || type === "videos") {
      const videoQuery = {
        isPublished: true,
        $or: [
          { title: { $regex: searchPattern } },
          { description: { $regex: searchPattern } },
          { tags: { $regex: searchPattern } },
          { keywords: { $regex: searchPattern } },
        ],
      };

      let videoSort = sort === "date" ? { createdAt: -1 } : sort === "views" ? { views: -1 } : { score: -1, createdAt: -1 };

      if (sort === "relevance") {
        const matchingVideos = await Video.find(videoQuery).populate("owner", "username fullName avatar").limit(50);

        const scoredVideos = matchingVideos.map(video => {
          let score = 0;
          const videoText = `${video.title} ${video.description} ${(video.tags || []).join(" ")} ${(video.keywords || []).join(" ")}`.toLowerCase();

          searchTerms.forEach(term => {
            if (video.title.toLowerCase().includes(term)) score += 10;
            if (video.description?.toLowerCase().includes(term)) score += 5;
            if (video.tags?.some(tag => tag.toLowerCase().includes(term))) score += 7;
            score += findSimilarWords(term, videoText.split(/\s+/)).length * 2;
          });

          score += (video.views || 0) / 1000;
          score += (video.likes || 0) / 100;

          return { ...video.toObject(), score };
        });

        searchResults.videos = scoredVideos.sort((a, b) => b.score - a.score).slice(0, parseInt(limit));
      } else {
        searchResults.videos = await Video.find(videoQuery).populate("owner", "username avatar").sort(videoSort).limit(parseInt(limit));
      }
    }

    // Search Users
    if (type === "all" || type === "channels") {
      const userQuery = {
        $or: [
          { username: { $regex: searchPattern } },
          { fullName: { $regex: searchPattern } },
          { bio: { $regex: searchPattern } },
        ],
      };

      let userResults = await User.find(userQuery).select("username avatar fullName subscribers bio").limit(parseInt(limit));

      if (sort === "relevance") {
        const scoredUsers = userResults.map(user => {
          let score = 0;
          const userText = `${user.username} ${user.fullName || ""} ${user.bio || ""}`.toLowerCase();

          searchTerms.forEach(term => {
            if (user.username.toLowerCase().includes(term)) score += 10;
            if (user.fullName?.toLowerCase().includes(term)) score += 8;
            if (user.bio?.toLowerCase().includes(term)) score += 5;
            score += findSimilarWords(term, userText.split(/\s+/)).length * 2;
          });

          score += (user.subscribers || 0) / 1000;

          return { ...user.toObject(), score };
        });

        searchResults.users = scoredUsers.sort((a, b) => b.score - a.score).slice(0, parseInt(limit));
      } else {
        const userSort = sort === "subscribers" ? { subscribers: -1 } : { username: 1 };
        searchResults.users = userResults.sort((a, b) => (userSort.subscribers ? b.subscribers - a.subscribers : a.username.localeCompare(b.username)));
      }
    }

    updateSearchResultCount(searchLog._id, searchResults.videos.length + searchResults.users.length);

    return res.status(200).json({ success: true, message: "Search results fetched successfully", data: searchResults });
  } catch (error) {
    console.error("Error in search:", error);
    return res.status(500).json({ success: false, message: "Error fetching search results", error: error.message });
  }
};

// Log search query middleware
export const logSearchQuery = async (req, res, next) => {
  try {
    if (!req.query.query) return next();

    const searchLog = new SearchQuery({
      query: req.query.query,
      type: req.query.type || "all",
      user: req.user ? req.user._id : null,
      clientIP: req.ip,
      userAgent: req.headers["user-agent"],
    });

    await searchLog.save();
    next();
  } catch (error) {
    console.error("Error in search logging:", error);
    next();
  }
};

// Track result clicks
export const trackResultClick = async (req, res) => {
  try {
    const { searchId, resultId, resultType, position } = req.body;

    if (!searchId || !resultId || !resultType || position === undefined) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const updatedSearch = await SearchQuery.findByIdAndUpdate(searchId, { $push: { clickedResults: { resultId, resultType, position } } }, { new: true });

    if (!updatedSearch) {
      return res.status(404).json({ success: false, message: "Search record not found" });
    }

    res.status(200).json({ success: true, message: "Click tracked successfully" });
  } catch (error) {
    console.error("Error tracking result click:", error);
    res.status(500).json({ success: false, message: "Error tracking click", error: error.message });
  }
};

// Update search result count
export const updateSearchResultCount = async (searchId, count) => {
  try {
    await SearchQuery.findByIdAndUpdate(searchId, { resultCount: count });
  } catch (error) {
    console.error("Error updating search result count:", error);
  }
};

// Get popular search terms
export const getPopularSearchTerms = async (req, res) => {
  try {
    const { limit = 10, days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const popularSearches = await SearchQuery.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: "$query", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) },
      { $project: { _id: 0, term: "$_id", count: 1 } }
    ]);

    res.status(200).json({ success: true, data: popularSearches });
  } catch (error) {
    console.error("Error getting popular searches:", error);
    res.status(500).json({ success: false, message: "Error fetching popular searches", error: error.message });
  }
};
