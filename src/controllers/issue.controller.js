import { Issue } from "../models/issue.model.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const reportIssue = async (req, res) => {
  try {
    if (!req.body.title || !req.body.description || !req.body.location) {
      return res.status(400).json({ message: "Title, description, and location are required" });
    }

    const location = typeof req.body.location === "string"
      ? JSON.parse(req.body.location)
      : req.body.location;

    if (!location?.type || !Array.isArray(location.coordinates)) {
      return res.status(400).json({ message: "Location must be in GeoJSON format: { type: 'Point', coordinates: [lng, lat] }" });
    }

    // ⬇️ Upload media to Cloudinary if file exists
    let uploadedMedia = null;
    if (req.file) {
      const cloudinaryRes = await uploadOnCloudinary(req.file.path);
      uploadedMedia = cloudinaryRes?.secure_url;
    }

    const newIssue = await Issue.create({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      location: location,
      media: uploadedMedia, // ✅ Store Cloudinary URL
      reportedBy: req.user._id,
      status: "Pending"
    });

    res.status(201).json(newIssue);
  } catch (error) {
    console.error("Error creating issue:", error);
    res.status(400).json({
      message: error.message,
      details: error.errors
    });
  }
};

export const getIssues = async (req, res) => {
  try {
    const { department, status, near } = req.query;
    const filter = {};
    
    if (department) filter.department = department;
    if (status) filter.status = status;
    
    // Geo-based query (e.g., ?near=40.7128,-74.0060&maxDistance=1000)
    if (near) {
      const [lat, lng] = near.split(',').map(parseFloat);
      filter.location = {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: parseInt(req.query.maxDistance) || 5000 // Default 5km
        }
      };
    }

    const issues = await Issue.find(filter)
      .populate('reportedBy', 'fullName email')
      .populate('assignedTo', 'fullName department');
      
    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching issues" });
  }
};

export const updateIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Prevent unauthorized role/status updates
    if (req.user.role !== 'admin') {
      delete updates.status;
      delete updates.assignedTo;
    }

    const updatedIssue = await Issue.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('reportedBy assignedTo');

    if (!updatedIssue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    res.json(updatedIssue);
  } catch (error) {
    res.status(400).json({ 
      message: "Validation failed",
      errors: error.errors 
    });
  }
};
// In your issues controller file (e.g., issue.controller.js)

export const getNearbyIssues = async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: "latitude and longitude are required" });
    }

    const maxDistance = radius ? parseInt(radius) : 5000; // default 5km

    const issues = await Issue.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: maxDistance,
        },
      },
    })
      .populate("reportedBy", "fullName email")
      .populate("assignedTo", "fullName department");

    res.json(issues);
  } catch (error) {
    console.error("Error fetching nearby issues:", error);
    res.status(500).json({ message: "Server error fetching nearby issues" });
  }
};
