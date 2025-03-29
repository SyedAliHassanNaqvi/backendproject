import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", // ✅ Allow frontend origin
    credentials: true, // ✅ Allow sending cookies & headers
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // ✅ Fixed typo
app.use(express.static("public"));
app.use(cookieParser());

// ✅ Import routes
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js"; // Ensure correct import
import commentRouter from "./routes/comment.routes.js";
import likeRouter from "./routes/like.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import searchRoutes from "./routes/searchRoutes.routes.js";

app.use("/api/v1/search", searchRoutes);

// ✅ Route registration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter); // Ensure videos are under "/api/v1/videos"
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/search", searchRoutes); // ✅ Ensure this is consistent

export { app };
