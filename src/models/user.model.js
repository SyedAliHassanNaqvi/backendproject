//user.model.js is same as user.js
//export line is returning an object which contains a model named User made out of userSchema
//trim schemaType trims the whitespaces
//index() is a method that is used to create an index on a field in a Mongoose schema. An index is a data structure that allows for efficient querying of data in a database.
//Schema.Types.ObjectId returns unique objectId of the video the user previously watched & after the "type" we always etner the field "ref"
//npm install bcrypt. It helps you to hash your password
//npm install jsonwebtoken. It transfers the data in an encrypted way.it is not possible to directly encrypt so we need help of mongoose hooks.'Pre' hook is used to do something just before a process e.g we can encrypt the password just before saving it.(plugin is also a hook).Hooks are mostly written in model files
import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"
//jwt is a bearer token ,whoever will send this token ,data will be transfered to him 
const userSchema = new Schema(
  {
    username:{
      type: String,
      required:true,
      unique:true,
      lowercase:true,
      trim:true,
      index: true,
    },
    email:{
      type: String,
      required:true,
      unique:true,
      lowercase:true,
      trim:true
    },
    fullName:{
      type: String,
      required:true,
      trim:true,
      index:true,
    },
    avatar:{
      type:String, //cloudnary url
      required:true,
    },
    coverImage:{
      type: String, //cloudnary url
    },
    watchHistoy:[
      {
        type: Schema.Types.ObjectId,
        ref: "Video"
      }
    ],
    password:
    {
      type:String,
      required:[true,"password is required"],  //just like this we can add string after true field

    },
    refreshToken:{
      type:String,
    },
    
  }, 
  {
    timestamps:true, //it will give us created at, updated at fields
  }
)

//we made the function async because encryption is a time taking process and we passed next cz its a middle ware and after that it should pass the flag next to next process
//bcrypt.hash takes 2 parameters this.password whic is to be encrypted and rounds (10)
//isModified is a built in function
//save parmeter is used to perform a function just before saving the program
userSchema.pre("save",async function (next){
  if (!this.isModified("password")) return next(); 
  this.password =await bcrypt.hash(this.password,10)
  next()
})

//now we'll create a custom method using mongoose properties
//bcrypt library can encrypt but also check the password so we'll ask it to check the pass. bcrypt.compare will take 2 params one will be the normal password which is "password" and the other will be the encrypted password which is "this.password "
//return gives result in true or false
userSchema.methods.isPasswordCorrect = async function(password){
  return await bcrypt.compare(password,this.password)
}
//we'll get _id from mongodb
userSchema.methods.generateAccessToken = function(){
 return jwt.sign({
    _id:this._id,
    email:this.email,
    username:this.username,
    fullName: this.fullname
  },
  process.env.ACCESS_TOKEN_SECRET,
  {
  expiresIn:process.env.ACCESS_TOKEN_EXPIRY
  }
)
}
userSchema.methods.generateRefreshToken = function(){
  return jwt.sign({
    _id:this._id,
    
  },
  process.env.REFRESH_TOKEN_SECRET,
  {
  expiresIn:process.env.REFRESH_TOKEN_EXPIRY
  }
) 
}

export const User= mongoose.model("User",userSchema)