const express = require("express");
const Story = require("../models/Story");

const router = express.Router();

// Auto-seed function
async function seedStoriesIfEmpty() {
  try {
    const count = await Story.countDocuments();
    if (count === 0) {
      console.log("🌱 Database is empty. Seeding initial travel stories...");
      const initialStories = [
        {
          name: "Yashi Kesarwani",
          dob: new Date("2003-05-15"),
          gender: "female",
          story: "Santorini is famous for its dramatically beautiful sunsets, particularly from the village of Oia. Watching the golden sun sink into the Aegean Sea while surrounded by iconic blue-domed churches and whitewashed houses is an unforgettable experience. The calm breeze, the historical pathways, and the local cuisine make it a paradise.",
          imageUrl: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80",
        },
        {
          name: "Siddhi Gupta",
          dob: new Date("2002-11-20"),
          gender: "female",
          story: "With its colorful houses nestled around a natural harbor, Vernazza is one of the most picturesque towns in Italy's Cinque Terre. Walking through the narrow cobblestone alleys, drinking local wine at the port, and listening to the waves crash against the colorful boats is pure Italian magic.",
          imageUrl: "https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?auto=format&fit=crop&w=800&q=80",
        },
        {
          name: "Shreya Gupta",
          dob: new Date("2004-03-10"),
          gender: "female",
          story: "Climbing in the Himalayas is the ultimate adventure. The sheer scale of the snow-covered peaks, the crisp mountain air, and the vibrant Sherpa culture create an inspiring journey of resilience and breathtaking beauty. Watching the sunrise over the high ridges leaves you in absolute awe of nature's majesty.",
          imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
        },
        {
          name: "Vaishnavi Sahu",
          dob: new Date("2003-08-25"),
          gender: "female",
          story: "Exploring the Great Barrier Reef opens up an underwater paradise filled with colorful coral gardens, playful sea turtles, and thousands of species of tropical fish. It is a mesmerizing wonderland of marine life. Snorkeling here makes you realize how fragile and beautiful our marine ecosystem truly is.",
          imageUrl: "https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&w=800&q=80",
        },
        {
          name: "Siddhi Gupta",
          dob: new Date("2002-11-20"),
          gender: "female",
          story: "Walking through the towering bamboo groves of Arashiyama in Kyoto is a deeply peaceful experience. The sound of the wind rustling through the green stalks creates a natural meditative atmosphere, transporting you to ancient Japan. The historic temples nearby complete this spiritual escape.",
          imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
        },
        {
          name: "Yashi Kesarwani",
          dob: new Date("2003-05-15"),
          gender: "female",
          story: "Witnessing the Aurora Borealis dance across the Arctic sky in Tromsø, Norway, is a dream come true. The emerald green and purple waves of light illuminate the snow-capped mountains in a magical celestial display. It is a humbling reminder of the universe's infinite beauty.",
          imageUrl: "https://images.unsplash.com/photo-1579033461380-adb47c3eb938?auto=format&fit=crop&w=800&q=80",
        }
      ];
      await Story.insertMany(initialStories);
      console.log("✅ Seeding completed! 6 beautiful travel stories added to database.");
    }
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
  }
}

// Call seeding logic on router load
seedStoriesIfEmpty();

/**
 * 📝 POST /api/stories
 * Upload a new travel story
 */
router.post("/", async (req, res) => {
  try {
    const { name, dob, gender, story, imageUrl, aiSummary, aiCategory, aiTags } = req.body;

    if (!name || !story || !imageUrl) {
      return res.status(400).json({ error: "Name, story content, and photo are required." });
    }

    // Automatically analyze if not provided by frontend
    const aiAnalysis = require("../services/aiService").analyzeStory(story);

    const newStory = await Story.create({
      name,
      dob: dob || null,
      gender: gender || null,
      story,
      imageUrl,
      aiSummary: aiSummary || aiAnalysis.summary,
      aiCategory: aiCategory || aiAnalysis.category,
      aiTags: aiTags || aiAnalysis.tags,
    });

    res.status(201).json({
      message: "Travel Story shared successfully! 🚀",
      data: newStory,
    });
  } catch (err) {
    console.error("Error creating travel story:", err);
    res.status(500).json({ error: "Server error while saving the story." });
  }
});

/**
 * 🧠 POST /api/stories/analyze
 * Run local ML NLP analysis on a travel story
 */
router.post("/analyze", async (req, res) => {
  try {
    const { story } = req.body;
    if (!story) {
      return res.status(400).json({ error: "Story content is required for analysis." });
    }

    const analysis = require("../services/aiService").analyzeStory(story);
    res.json({
      success: true,
      data: analysis
    });
  } catch (err) {
    console.error("AI Analysis error:", err);
    res.status(500).json({ error: "Failed to analyze story content." });
  }
});

/**
 * 📖 GET /api/stories
 * Get stories with pagination (for infinite scrolling / lazy-loading)
 */
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4; // default 4 per page
    const skip = (page - 1) * limit;

    const total = await Story.countDocuments();
    const stories = await Story.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      stories,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalStories: total,
      hasMore: skip + stories.length < total,
    });
  } catch (err) {
    console.error("Error fetching stories:", err);
    res.status(500).json({ error: "Server error while fetching stories." });
  }
});

/**
 * 🗺️ GET /api/stories/:id/recommendations
 * Fetch top 3 content-based recommended stories using TF-IDF & Cosine Similarity
 */
router.get("/:id/recommendations", async (req, res) => {
  try {
    const { id } = req.params;
    const recommendations = await require("../services/recommendationService").getRecommendations(id);
    res.json(recommendations);
  } catch (err) {
    console.error("Error fetching recommendations:", err);
    res.status(500).json({ error: "Server error while calculating recommendations." });
  }
});

module.exports = router;
