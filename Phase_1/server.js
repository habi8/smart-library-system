import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import usersRouter from './routes/users.js';
import booksRouter from './routes/books.js';
import loansRouter from './routes/loans.js';
import statsRouter from './routes/stats.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.status(200).json({
      status: "OK",
      database: "Connected",
      dbName: mongoose.connection.name,
      uptime: process.uptime(),
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      database: "Disconnected",
      error: error.message,
    });
  }
});

// Routes
app.use("/api/users", usersRouter);
app.use("/api/books", booksRouter);
app.use("/api/loans", loansRouter);
app.use("/api/stats", statsRouter);

// MongoDB Atlas connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB Atlas");
    console.log(
      "MongoDB URI:",
      process.env.MONGODB_URI.replace(/:([^:@]+)@/, ":****@")
    ); // Hide password
    console.log("Database name:", mongoose.connection.name);
  })
  .catch((err) => {
    console.error("MongoDB Atlas connection error:", err.message);
    console.error("Stack:", err.stack);
  });

// Log connection events
mongoose.connection.on("connected", () =>
  console.log("Mongoose connected to Atlas")
);
mongoose.connection.on("disconnected", () =>
  console.warn("Mongoose disconnected from Atlas")
);
mongoose.connection.on("error", (err) =>
  console.error("Mongoose error:", err.message)
);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));