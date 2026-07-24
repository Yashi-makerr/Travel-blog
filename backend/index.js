const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const messageRoutes = require("./routes/messageRoutes"); // agar abhi nahi banaya to is line ko comment kar dena
const storyRoutes = require("./routes/storyRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();
const PORT = process.env.PORT || 5001;

// MongoDB Connection URI (reads from environment variables on Render, falls back to hardcoded string locally)
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://ykesarwani41_db_user:PUqtOfuBFi17dLTT@cluster0.ndbctps.mongodb.net/travel_blog?retryWrites=true&w=majority&appName=Cluster0";

// Middlewares
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Routes
app.use("/api/auth", authRoutes);        // login/signup
app.use("/api/messages", messageRoutes); // contact form
app.use("/api/stories", storyRoutes);    // travel stories
app.use("/api/ai", aiRoutes);            // AI Companion chatbot
// app.use("/api/messages", messageRoutes); // contact form ke liye, jab ready ho

// Test route
app.get("/", (req, res) => {
  res.send("Travel Blog Backend Running 🚀");
});

// DB connect + server start
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    
    // One-time image correction for Yashi's Norway story
    const Story = require("./models/Story");
    Story.updateMany(
      { name: "Yashi Kesarwani", story: { $regex: "Aurora Borealis", $options: "i" } },
      { $set: { imageUrl: "https://images.unsplash.com/photo-1579033461380-adb47c3eb938?auto=format&fit=crop&w=800&q=80" } }
    ).then(() => {
      console.log("✏️ Updated Yashi's Norway story image in DB");
    }).catch(err => console.error("❌ DB update failed:", err.message));

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });
