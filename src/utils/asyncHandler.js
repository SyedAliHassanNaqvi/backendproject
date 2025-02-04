//PROMISES BASED
//in promise line catch means it failed so we'll have an err next means that we pass to next so which ever thing has to be done next can start.
const asyncHandler = (requestHandler)=>{
 return (req,res,next)=>{
  Promise.resolve(requestHandler(req,res,next)).catch((err)=> next(err))
 }
}
export  {asyncHandler};
// TRY CATCH BASED
// higher order wo functions jo k function ko as a parameter bhi accept krskty hain ya phir usko return kr skty hain. Insted of this (fn)=>{} "bcz {} means callback" we'll write (fn)=>()=>{} this is same as (fn)=>{()=>{} }
//we'll extract req,res from the function"fn" we passed and also next cz we can use sort of middlewares anytime

//if the user passes the error code we'll simply use err.code to get it otherwise we'll simple use default code 500
//we'll also send .json response and in it we'll send success flag so that it becomes easier for the frontend developer
//const asyncHandler = (fn)=>async(req,res,next)=>{
//  try {
//    await fn(req,res,next)
//  } catch (error) {
//    res.status(err.code || 500).json({
//      success:false,
//      message:err.message
//    })
//  }
//}