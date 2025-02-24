import mongoose,{Schema} from "mongoose";
//we installed npm install mongoose-aggregate-paginate-v2
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new Schema(
  {
    content:{
      type:String,
      required:true,
    },
    video:{
      type:Schema.Types.ObjectId,
      ref: "Video"
    },
    owner:{
      type:Schema.Types.ObjectId,
      ref:"User"
    },

  },
  {
    timestamps:true
  }

)

commentSchema.plugin(mongooseAggregatePaginate)
//this provides the ability to control the paginate e.g from where to where wev'e to give the the videos



export const Comment = mongoose.model("Comment",commentSchema)