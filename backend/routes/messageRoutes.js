// backend/routes/messageRoutes.js
const express = require("express");
const Message = require("../models/Message");

const router = express.Router();

/**
 *  📩 POST /api/messages
 *  New message save karega (contact form se)
 */
router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newMsg = await Message.create({ name, email, message });

    res.status(201).json({
      message: "Message saved successfully 🎉",
      data: newMsg,
    });
  } catch (err) {
    console.error("Error saving message:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 *  📥 GET /api/messages
 *  Saare messages list karega (for admin / you)
 */
router.get("/", async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
