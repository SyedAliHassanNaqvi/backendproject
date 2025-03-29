import mongoose from "mongoose";

const searchQuerySchema = new mongoose.Schema(
  {
    query: { type: String, required: true, trim: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: { type: String, enum: ["all", "videos", "channels"], default: "all" },
    resultCount: { type: Number, default: 0 },
    clickedResults: [
      {
        resultId: { type: mongoose.Schema.Types.ObjectId, required: true },
        resultType: { type: String, enum: ["video", "channel"], required: true },
        position: { type: Number, required: true },
      },
    ],
    clientIP: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);
// Then update your search query to include keywords


const SearchQuery = mongoose.model("SearchQuery", searchQuerySchema);
export default SearchQuery;
