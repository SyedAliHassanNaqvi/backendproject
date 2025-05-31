import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import adminRoutes from "./routes/admin.routes.js";
// ✅ Import routes
import userRouter from "./routes/user.routes.js";

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




// Add this with your other route imports
import issueRouter from "./routes/issue.routes.js";
import { verifyJWT } from "./middlewares/auth.middleware.js";
import messageRoutes from "./routes/message.routes.js";

// Add this with your other route uses
app.use("/api/v1/issues", issueRouter);


// ✅ Route registration
app.use("/api/v1/users", userRouter);

app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/messages",messageRoutes);



export { app };
