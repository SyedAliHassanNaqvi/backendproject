// controllers/admin.controller.js

import { User } from "../models/user.model.js";

export const getAllUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};

export const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  await User.findByIdAndUpdate(id, { role });
  res.json({ message: "Role updated" });
};

export const deactivateUser = async (req, res) => {
  const { id } = req.params;
  await User.findByIdAndUpdate(id, { isActive: false });
  res.json({ message: "User deactivated" });
};

export const assignTaskToOfficial = async (req, res) => {
  const { id } = req.params;
  const { taskId } = req.body;
  const user = await User.findById(id);
  if (user.role !== "official") {
    return res.status(400).json({ message: "Only Department Officials can be assigned tasks." });
  }
  user.assignedTasks.push(taskId);
  await user.save();
  res.json({ message: "Task assigned." });
};
