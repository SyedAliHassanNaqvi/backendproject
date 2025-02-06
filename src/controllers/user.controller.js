import {asyncHandler} from "../utils/asyncHandler.js";
import  {ApiError}  from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary,deleteFromCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

const generateAccesAndRefreshTokens = async (userId) =>{
  try{
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    //saving the refershToken in user model's refresh token string
    user.refreshToken = refreshToken
    //cz in mongoose's model there are some required fields marked true so we'll have to ignore all the validation in the mongoose model (user)
    await user.save({validateBeforeSave: false})

    return ({accessToken,refreshToken})
  }
  catch(error){
    throw new ApiError(500, "something went wrong while generating access and refresh token")
  }
  

}


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
  //Extracts the fullName property from req.body and assigns it to the variable fullName.
  //Extracts the email property from req.body and assigns it to the variable email.
  //Extracts the password property from req.body and assigns it to the variable password.
  //Extracts the username property from req.body and assigns it to the variable username.
  //console.log("email", email);
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
  const existedUser = await User.findOne({
    $or: [{email},{username}]
  })
  if(existedUser){
    throw new ApiError (409, "User with email or username exists")
  }
  //console.log(req.files)
  // middleware req k ander aur fields add krta req k aagy multer is providing us the .files field
  //[0] means first property wwhich will give us the path.path will gives us the path where the multer stored the file, [0] means first property wwhich will give us the path
  const avatarLocalPath = req.files?.avatar?.length > 0 ? req.files.avatar[0].path : null;
if (!avatarLocalPath) {
  throw new ApiError(400, "Avatar file is required!");
}

  //const coverImageLocalPath=req.files?.coverImage[0]?.path
  //below code is for handling if the cover image is not provided
  let coverImageLocalPath;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
    coverImageLocalPath = req.files.coverImage[0].path
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

  return res.status(201).json({
    message: new ApiResponse(200, createdUser, "User registered Successfully")
  });
  

})

const loginUser = asyncHandler (async (req,res)=>{
  // req body -> data
  // username or email
  // find the user
  // password check
  // access and refresh token 
  // send cookies

  // req body -> data
  const {email,password,username} = req.body
  
  if(!(username || email )){
    throw new ApiError (400, "Username or email is required ! ")
  }
  // check for the username or email in the db (cz the user must be signedup and must be available in the db)
  const user = await User.findOne({
    $or: [{email},{username}]
  })
  //findOne finds the required one element from db and returns it
  if(!user)
  {
    throw new ApiError(404, "User does not exisst")
  }


  const isPasswordValid = await user.isPasswordCorrect(password)
  // we used user instead of User to call the isPasswordCorrect function because capital User is an object of mongodb's mongoose and it contains functions like findOne , updateOne etc but the methods we created in usermodel like isPasswordCorrect and generatToken etc, these are available in our created "user" (small)
  if(!isPasswordValid)
  {
    throw new ApiError(401, "Incorrect Password")
  }

  const {accessToken,refreshToken} = await generateAccesAndRefreshTokens(user._id)

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

  // cookies
  const options = {
    httpOnly :true,
    secure:true,
  }

  return res
  .status(200)
  .cookie("accessToken", accessToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json(
    new ApiResponse(
      200,
      {
        user: loggedInUser, accessToken , refreshToken
      },
      "User logged in successfully"
    )
  )
})

const logoutUser = asyncHandler (async(req,res)=>{
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        refreshToken: undefined
      }
    },
    {
      new:true
    }
    
  
  )
  // cookies
  const options = {
    httpOnly :true,
    secure:true,
  }

  return res
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(new ApiResponse(200,{}, "user logged out successfully"))

})

const refreshAccessToken = asyncHandler(async(req,res)=>{
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
  if(!incomingRefreshToken){
    throw new ApiError(401, "unauthorized request (incoming r.token)")
  }
  try {
    const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
  
    const user = await User.findById(decodedToken?._id)
  
    if(!user)
    {
      throw new ApiError(401, "Invalid refresh token")
    }
    if(incomingRefreshToken !== user?.refreshToken)
    {
      throw new ApiError (401, "Refresh token is expired or used")
    }
  
    const options = {
      httpOnly:true,
      secure:true
    }
  
    const {accessToken,newRefreshToken} = await generateAccesAndRefreshTokens(user._id)
  
    return res
    .status(200)
    .cookie("accessToken",accessToken, options)
    .cookie("refreshToken",newRefreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          accessToken,refreshToke: newRefreshToken
        },
        "Access token refereshed"
      )
    )
  } catch (error) {
    throw new ApiError (401 , error?.message || "Invalid refresh Token")
  }
})
// in case of mobile app where cookies are not available, we wrote in OR : req.body.refreshToken

const changeCurrentPassword = asyncHandler (async (req,res)=>{
  const {oldPassword, newPassword} = req.body
  const user = await User.findById(req.user?._id)
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
  if(!isPasswordCorrect){
    throw new ApiError(400, "Invalid Old Password")
  }
    user.password = newPassword
    await user.save({validateBeforeSave : false})

    return res
    .status(200)
    .json(
      new ApiResponse(200, {}, "Password Changed Successfully")
    )
  
})

const getCurrentUser = asyncHandler ( async (req,res) =>{
  return res
  .status(200)
  .json(
    ApiResponse(200,req.user,"Current user fetched successfully")
  )
})

const updateAccountDetails = asyncHandler ( async (req,res)=>{
  const {fullName,email} = req.body
  if(!fullName || !email){
    throw new ApiError(400, "both email and fullName is required")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      fullName,// both fullName Or fullName: fullName are correct
      email: email, //similar to email,
    },
    {new: true}//new true means update info will be returned and stored in the "user"
  ).select("-password")

  return res
  .status(200)
  .json (new ApiResponse(200, user, "Account Details updated successfully"))
})

//now we're gonna update file(avatar and coverimage )changes for this purpose we'll have to use to middleware in the route first is use multer for file upload and second is verifyJWT for checking if the user is logged in or not Lets write
const updateUserAvatar = asyncHandler(async(req,res)=>{
  const avatarLocalPath = req.file?.path // this will get the path of avatar using multer middleware 
  if(!avatarLocalPath){
    throw new ApiError(400, "Avatar file is missing ")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)

  if(!avatar.url){
    throw new ApiError(400, "Error while uplaoding avatar on cloudinary ")
  }

  //delete old avatarimage
  const oldAvatar= await User.findById(req.user._id)
  if(oldAvatar?.avatar){
    await deleteFromCloudinary(oldAvatar.avatar)
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      avatar: avatar.url
    },
    {new: true}
  ).select("-password")

  return res
  .status(200)
  .json(
    new ApiResponse(200,user, "Avatar Uploaded Successfully")
  )
})

const updateUserCoverImage = asyncHandler(async(req,res)=>{
  const coverImageLocalPath = req.file?.path // this will get the path of avatar using multer middleware 
  if(!coverImageLocalPath){
    throw new ApiError(400, "CoverImage file is missing ")
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if(!coverImage.url){
    throw new ApiError(400, "Error while uplaoding coverImage on cloudinary ")
  }

  //delete old coverImage
  const oldCover= await User.findById(req.user._id)
  if(oldCover?.coverImage){
    await deleteFromCloudinary(oldCover.coverImage)
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      coverImage: coverImage.url
    },
    {new: true}
  ).select("-password")

  return res
  .status(200)
  .json(
    new ApiResponse(200,user, "Cover Image Updated Successfully")
  )
})

export {registerUser, loginUser,logoutUser,refreshAccessToken,changeCurrentPassword,getCurrentUser,updateUserAvatar,updateUserCoverImage }; 