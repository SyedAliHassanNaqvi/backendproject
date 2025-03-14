import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
//cookie parsor's work is just to access and set cookies from the user's browser
//only server  can read and remove those cookies 

const app = express()


app.use(
  cors({
    origin: "http://localhost:5173", // ✅ Allow frontend origin
    credentials: true, // ✅ Allow sending cookies & headers
  })
);
//cors is used to allow the request from different origins
//express.json means i'm accepting json in the below config (inshort to get json data we used express.json) its form data. Limit means we're allowing data under this limit.
app.use(express.json({limit:"16kb"}))
//to get data from url extended true means we can give objects within object(nested objects)
app.use(express.urlencoded({extened:true, limit:"16kb"}))
//static is used to store public assets like files,pdfs etc it will be stored in public folder
app.use(express.static("public"))

app.use(cookieParser())



//import routes
import userRouter from './routes/user.routes.js';
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"


//routes declaration
app.use("/api/v1/users",userRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/tweets",tweetRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/dashboard", dashboardRouter)
  
export  {app};