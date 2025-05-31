// routes/message.routes.js
import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { sendMessage, getMessages } from "../controllers/message.controller.js";

const router = express.Router();

router.post("/send", verifyJWT, sendMessage);
router.get("/", verifyJWT, getMessages); // Get chat with a specific user

export default router;
