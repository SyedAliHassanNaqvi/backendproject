import mongoose from "mongoose";

const issueSchema = new mongoose.Schema({
  title: String,
  description: String,
  location: {
    type: { type: String, default: "Point" },
    coordinates: [Number]
  },
  category: String,
  status: { type: String, default: "Pending" },
  media: [String],
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  department: String,
  createdAt: { type: Date, default: Date.now }
});

issueSchema.index({ location: "2dsphere" });

export const Issue = mongoose.model("Issue", issueSchema);