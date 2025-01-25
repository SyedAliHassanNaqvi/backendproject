import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
//async await used cz it will take time to connect
//we'll also use try catch here cz error can occur
const connectDB = async ()=>{
  try{
    const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    console.log(`\n MongoDB connected!! DB HOST ${connectionInstance.connection.host}`)
  }catch (error){
    console.log("MONGODB connection error",error);
    process.exit(1)
  }
}

export default connectDB;