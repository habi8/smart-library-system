import User from '../models/Users.js';
import mongoose from 'mongoose';

export const createUser = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    });
  } catch (error) {
    console.error("User creation error:", error.message);
    res.status(400).json({ error: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ error: "Server error: " + error.message });
  }
};

export const getUser = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid user_id format" });
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    });
  } catch (error) {
    console.error("Error fetching user:", error.message);
    res.status(500).json({ error: "Server error: " + error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid user_id format" });
    }

    const { name, email, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, updated_at: Date.now() },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    });
  } catch (error) {
    console.error("Error updating user:", error.message);
    res.status(400).json({ error: "Server error: " + error.message });
  }
};

// Helper method for other controllers
export const getUserById = async (userId, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ error: "Invalid user_id format" });
      return null;
    }
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return null;
    }
    return user;
  } catch (error) {
    res.status(500).json({ error: "Server error: " + error.message });
    return null;
  }
};

export const getAllUsersCount = async (res) => {
  try {
    const count = await User.countDocuments();
    return count;
  } catch (error) {
    res.status(500).json({ error: "Server error: " + error.message });
    return 0;
  }
};