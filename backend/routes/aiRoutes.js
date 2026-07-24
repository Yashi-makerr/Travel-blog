const express = require("express");
const router = express.Router();
const geminiService = require("../services/geminiService");

/**
 * 🤖 POST /api/ai/chat
 * Handles user chat sessions with the travel companion
 */
router.post("/chat", async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message content is required." });
    }

    const aiResponse = await geminiService.generateTravelResponse(message, history || []);

    res.json({
      success: true,
      response: aiResponse
    });
  } catch (err) {
    console.error("Error in AI chat route:", err);
    res.status(500).json({ error: "Server error occurred during conversation." });
  }
});

module.exports = router;
