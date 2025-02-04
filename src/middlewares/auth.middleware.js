import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js"


//bcz hamare pas user ka access iss method mein nni hai iss liyay we decoded the token to logout
export const verifyJWT = asyncHandler(async(req,res, next)=>{
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    
    if(!token){
      throw new ApiError(401, "Unauthorized request")
    }
  
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
  
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    if(!user){
      //NEXT VIDEO : Discuss about frontend
      throw new ApiError(401, "Invalid Access Token")
    }
    //req.user : we created a user object in req
    req.user = user;
    next()
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token")
  }

})