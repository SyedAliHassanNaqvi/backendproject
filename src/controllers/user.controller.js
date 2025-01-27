import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler (async (req, res)=>{
  // get user details from frontend
  // validation - not empty
  // check if user already exists: username,email
  // check for images, check for avatar
  // upload them to cloudinary,avatar 
  // create user object - create entry in db
  // remove password and refresh token firled from the reponse
  // check for user creation
  // return response

  const {fullName, email, password, username}=req.body
  console.log("email", email);
  // The some() method executes the callback function once for each array element.
  // after some we can also write some.((field)=>field?.trim() === "" return true})
  //means if the field will be empty even after whitespaces removed then it will return true
  if(
    [fullName, email, password, username].some((field)=> field?.trim() === "")
  ){
    throw new ApiError(400, "All fields are required")
  }
  //$or means we'll add OR between every element in the array
  //User contacts the DB to find the required fields
  const existedUser = User.findOne({
    $or: [{email},{password}]
  })
  if(existedUser){
    throw new ApiError (409, "User already exists")
  }
  // middleware req k ander aur fields add krta req k aagy multer is providing us the .files field
  //.path will gives us the path where the multer stored the file, [0] means first property wwhich will give us the path
  const avatarLocalPath=req.files?.avatar[0]?.path;
  const coverImageLocalPath=req.files?.coverImage[0]?.path

  if(!avatarLocalPath){
    throw new ApiError(400, "Avatar file is required!")
  }
  //upload on cloudinary
  const avatar=await uploadOnCloudinary(avatarLocalPath)
  const coverImage=await uploadOnCloudinary(coverImageLocalPath)

  if(!avatar){
    throw new ApiError(400, "avatar file is required")
  }
  //mostly User talks to the DB
  //create user in db
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage:coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()  
  })
  //check user creation by id
  //mongoDB automatically creates _id for the new entry
  //.select is used to remove password & refreshToken
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if(!createdUser){
    throw new ApiError(500, "Something went wrong while registering the user")
  }

  return res.status(201).json(
    throw new ApiResponse(200,createdUser,"User registered Successfully")
  )

})


export {registerUser}; 