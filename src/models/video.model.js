import mongoose,{Schema} from "mongoose";
//we installed npm install mongoose-aggregate-paginate-v2
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
//we can't send all the videos to the user we've to give pagination like the user can load more videos or can show on the next page

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
      type: SchemaType.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps:true,
  }
)

videoSchema.plugin(mongooseAggregatePaginate)
export const Video = mongoose.model("Video",videoSchema)