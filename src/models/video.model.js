import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
  {
    videoFile:{
      type:String, //cloudinary url
      required:true,
    },
    thumbnail:{
      type:String, //cloudinary url
      required:true,
    },
    title:{
      type:String, 
      required:true,
    },
    description:{
      type:String, 
      required:true,
    },
    duration:
    {
      type:Number, //cloudinary url
      required:true,
    },
    views:{
      type:Number,
      default:0
    },
    isPublished:{
      type:Boolean,
      default:true
    },
    owner:{
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    keywords: [{ type: String }],
    tags: [{ type: String }]
  },
  {
    timestamps:true,
  }
)

// Extract keywords function
const extractKeywords = (text) => {
  if (!text) return [];
  
  // Convert to lowercase and remove special characters
  const cleanText = text.toLowerCase().replace(/[^\w\s]/g, ' ');
  
  // Split by spaces and filter out common words and short words
  const words = cleanText.split(/\s+/).filter(word => {
    // Filter out common words (stop words) and words shorter than 3 characters
    const stopWords = ['the', 'and', 'or', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were'];
    return word.length >= 3 && !stopWords.includes(word);
  });
  
  // Return unique words
  return [...new Set(words)];
};

// Pre-save hook for keyword extraction
videoSchema.pre('save', function(next) {
  if (this.isModified('title') || this.isModified('description')) {
    // Extract keywords from title and description
    const titleKeywords = extractKeywords(this.title);
    const descKeywords = extractKeywords(this.description);
    
    // Combine keywords and remove duplicates
    const allKeywords = [...new Set([...titleKeywords, ...descKeywords])];
    
    // Store keywords in the video document
    this.keywords = allKeywords;
  }
  next();
});

videoSchema.plugin(mongooseAggregatePaginate)
export const Video = mongoose.model("Video", videoSchema)