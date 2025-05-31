// controllers/message.controller.js
import { Message } from "../models/message.model.js";


export const sendMessage = async (req, res) => {
  try {
    const { content } = req.body;

    const message = await Message.create({
      sender: req.user._id,
      content,
    });

    res.status(201).json(message);
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};


export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({})
      .sort({ timestamp: 1 })
      .populate("sender", "fullName role");

    res.json(messages);
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

