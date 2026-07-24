const Story = require("../models/Story");

// Clean and tokenise query to extract search keywords
function extractSearchKeywords(text) {
  if (!text) return [];
  const stopwords = new Set(['do', 'you', 'have', 'stories', 'about', 'tell', 'me', 'the', 'what', 'is', 'are', 'any', 'blog', 'posts', 'trip', 'travel', 'to', 'for', 'in', 'on', 'with', 'a', 'an']);
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopwords.has(word));
}

// Helper: Extract a brief title sentence from blog text
function extractTitle(storyText) {
  if (!storyText) return "My Travel Memoir";
  const sentences = storyText.split(/[.!?]/);
  let title = sentences[0] || "My Travel Memoir";
  const words = title.trim().split(/\s+/);
  if (words.length > 8) {
    return words.slice(0, 8).join(" ") + "...";
  }
  return title;
}

/**
 * Builds a catalog text block of all blog posts available in the system
 */
async function getStoriesCatalog() {
  try {
    const stories = await Story.find().sort({ createdAt: -1 });
    let catalog = "Catalog of all user-submitted travel stories on OceanBound Travels:\n";
    stories.forEach((s, i) => {
      catalog += `- Story #${i+1}:
  Title: "${extractTitle(s.story)}"
  Author: ${s.name}
  Category: ${s.aiCategory || 'General'}
  Tags: ${(s.aiTags || []).join(', ')}
  Full Experience: "${s.story}"
  Summary: "${s.aiSummary || 'N/A'}"
  
`;
    });
    return { catalog, stories };
  } catch (err) {
    console.error("Error building story catalog:", err);
    return { catalog: "", stories: [] };
  }
}

/**
 * Intelligent local fallback when GEMINI_API_KEY is not configured.
 * Generates custom suggestions based on database story matches and appends the recommendations list.
 */
function generateLocalSimulation(userMessage, stories) {
  let reply = "✈️ **[Local Simulation Mode - Add GEMINI_API_KEY to .env for live AI]**\n\n";
  const query = userMessage.toLowerCase();
  
  let suggestions = "";
  let matchedItems = [];
  
  // Clean query and search database stories for keyword intersections
  const keywords = extractSearchKeywords(userMessage);
  
  stories.forEach(s => {
    const storyText = s.story.toLowerCase();
    const nameText = s.name.toLowerCase();
    const catText = (s.aiCategory || "").toLowerCase();
    const tagsText = (s.aiTags || []).join(" ").toLowerCase();
    
    const isMatched = keywords.some(kw => 
      storyText.includes(kw) || 
      nameText.includes(kw) || 
      catText.includes(kw) || 
      tagsText.includes(kw)
    );
    
    if (isMatched) {
      matchedItems.push(s);
    }
  });
  
  // Fallback: if no keyword matches, select the top 2 stories
  if (matchedItems.length === 0 && stories.length > 0) {
    matchedItems = stories.slice(0, 2);
  }
  
  // Build customized travel suggestions
  if (query.includes("itinerary") || query.includes("plan") || query.includes("days")) {
    suggestions += `Here is a custom simulated 3-day itinerary suggestion matching your interest:\n\n`;
    if (matchedItems.length > 0) {
      const topMatch = matchedItems[0];
      suggestions += `* **Day 1: Settle in & Explore ${extractTitle(topMatch.story)}** - Arrive at your destination and experience the unique scenery and local neighborhood as described by **${topMatch.name}**.\n`;
      suggestions += `* **Day 2: Main Activity & Adventure** - Dedicate the day to typical activities in the **${topMatch.aiCategory || 'adventure'}** category. Hiring a local guide is highly recommended!\n`;
      suggestions += `* **Day 3: Scenic Views & Departure** - Catch the sunrise, pick up local souvenirs, and head back home.\n\n`;
    } else {
      suggestions += `* **Day 1: Arrival & Orientation** - Check in, explore the local historic downtown, and dine at a traditional café.\n`;
      suggestions += `* **Day 2: Adventure & Sights** - Visit the landmark scenic spots early in the morning.\n`;
      suggestions += `* **Day 3: Souvenirs & Depart** - Buy local crafts and check out.\n\n`;
    }
  } else {
    suggestions += `I have explored our travel blogs database to assist you. Based on your travel interest, here are some suggestions:\n\n`;
    matchedItems.forEach(doc => {
      suggestions += `* For **${doc.aiCategory ? doc.aiCategory.toUpperCase() : 'WANDERLUST'}** lovers: Experience the details of **${extractTitle(doc.story)}** as shared by **${doc.name}**. Focus on the local guide recommendations, local wines, or specific sunset spots they mentioned.\n`;
    });
    suggestions += `\n`;
  }
  
  reply += suggestions;
  
  // Append 'Relevant Adventures to Read' section at the end
  reply += `### 📖 Relevant Adventures to Read\n`;
  if (matchedItems.length > 0) {
    matchedItems.forEach(doc => {
      const docCat = doc.aiCategory || 'wanderlust';
      reply += `- **${extractTitle(doc.story)}** by ${doc.name} (Category: ${docCat.toUpperCase()})\n  *Why read this: Check out this blogger's direct experience and review their advice first.*\n`;
    });
  } else {
    reply += `*(No stories found in database matching your specific query, configure Gemini API key to query external travel knowledge!)*\n`;
  }
  
  return reply;
}

/**
 * Communicates with Gemini via REST API (or triggers fallback) to answer travel prompts
 */
async function generateTravelResponse(userMessage, history = []) {
  // Retrieve catalog of all stories
  const { catalog, stories } = await getStoriesCatalog();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log("⚠️ GEMINI_API_KEY is not set. Falling back to simulated AI response.");
    return generateLocalSimulation(userMessage, stories);
  }

  try {
    // Format chat history for Gemini REST API
    const contents = history.map(item => ({
      role: item.role === "user" ? "user" : "model",
      parts: [{ text: item.text }]
    }));

    // Add current user message
    contents.push({
      role: "user",
      parts: [{ text: userMessage }]
    });

    const systemPrompt = `You are "OceanBound AI Companion", an expert AI travel assistant built into the OceanBound Travel Blog.
Your goal is to assist travelers with itineraries, destination highlights, packing advice, and local tips.

CRITICAL REQUIREMENTS:
1. DO NOT give generic or generalized travel advice. Use the real-life travel blogs in our database as the primary source for your suggestions, tips, and itineraries.
2. Explore the complete catalog of all travel stories provided below. Find which experiences are relevant to the user's inquiry.
3. Provide concrete suggestions, tips, or itineraries. For example, if the user asks about Italy, mention Siddhi Gupta's trip to Vernazza and highlight details from it.
4. At the very end of your response, you MUST list the relevant travel stories from our database that correspond to your suggestions. Format the list exactly as shown below, using Markdown links matching the template:

### 📖 Relevant Adventures to Read
- **[Story Title]** by [Author Name] (Category: [Category])
  *Why read this: [One sentence explaining how this user's experience is relevant and what tips it offers]*

Here is the complete catalog of stories in our database:
---
${catalog}
---

Ground your suggestions in these actual blog posts and present the 'Relevant Adventures to Read' section at the end of your response.`;

    // Make native fetch call to Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: contents,
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API responded with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error("Invalid response format from Gemini REST API");
    }
  } catch (err) {
    console.error("Gemini API call failed:", err);
    return `❌ **Error connecting to Gemini API**: ${err.message}\n\nRunning in local simulation mode as backup:\n\n${generateLocalSimulation(userMessage, stories)}`;
  }
}

module.exports = {
  generateTravelResponse,
  getStoriesCatalog
};
