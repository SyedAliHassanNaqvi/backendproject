import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
//cookie parsor's work is just to access and set cookies from the user's browser
//only server  can read and remove those cookies 

const app = express()

app.use(cors({
  origin:process.env.CORS_ORIGIN,
  credentials:true
}))
//express.json means i'm accepting json in the below config (inshort to get json data we used express.json) its form data. Limit means we're allowing data under this limit.
app.use(express.json({limit:"16kb"}))
//to get data from url extended true means we can give objects within object(nested objects)
app.use(express.urlencoded({extened:true, limit:"16kb"}))
//static is used to store public assets like files,pdfs etc it will be stored in public folder
app.use(express.static("public"))

app.use(cookieParser())

//import routes
import userRouter from './routes/user.routes.js';


//routes declaration
app.use("/api/v1/users",userRouter)


  
export  {app};