const Story = require("../models/Story");

// Stop words to clean up text content before analysis
const STOP_WORDS = new Set([
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', "you're", "you've", "you'll", "you'd",
  'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', "she's", 'her', 'hers',
  'herself', 'it', "it's", 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which',
  'who', 'whom', 'this', 'that', "that'll", 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if',
  'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between',
  'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out',
  'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why',
  'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
  'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', "don't", 'should',
  "should've", 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', "aren't", 'couldn', "couldn't",
  'didn', "didn't", 'doesn', "doesn't", 'hadn', "hadn't", 'hasn', "hasn't", 'haven', "haven't", 'isn', "isn't",
  'ma', 'mightn', "mightn't", 'mustn', "mustn't", 'needn', "needn't", 'shan', "shan't", 'shouldn', "shouldn't",
  'wasn', "wasn't", 'weren', "weren't", 'won', "won't", 'wouldn', "wouldn't", 'is', 'was', 'were', 'am',
  'also', 'really', 'extremely', 'quite', 'made', 'take', 'went', 'saw', 'got', 'put', 'came', 'get', 'like'
]);

/**
 * Basic tokenizer: lowercases, removes punctuation, filters short/stop words
 */
function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word));
}

/**
 * Calculates Cosine Similarity between two vector representations
 * similarity = (A . B) / (||A|| * ||B||)
 */
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const term in vecA) {
    dotProduct += vecA[term] * (vecB[term] || 0);
    normA += vecA[term] * vecA[term];
  }

  for (const term in vecB) {
    normB += vecB[term] * vecB[term];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Retrieves the top similar stories for a specific story ID
 * @param {string} storyId - The MongoDB ID of the story to match
 * @param {number} limit - Maximum number of recommendations to return
 */
async function getRecommendations(storyId, limit = 3) {
  // Fetch all stories from MongoDB
  const stories = await Story.find();
  if (stories.length <= 1) return [];

  // Find the target story
  const targetStory = stories.find(s => s._id.toString() === storyId.toString());
  if (!targetStory) {
    throw new Error("Target travel story not found in database.");
  }

  // Combine story content, category and tags for vector matching
  const getStoryContent = (s) => {
    return `${s.story} ${s.aiCategory || ''} ${(s.aiTags || []).join(' ')} ${s.name}`;
  };

  // 1. Preprocess documents and count terms
  const allDocs = stories.map(s => ({
    id: s._id.toString(),
    tokens: tokenize(getStoryContent(s)),
    storyData: s
  }));

  // Build vocabulary & compute Document Frequencies (DF)
  const df = {};
  allDocs.forEach(doc => {
    const uniqueTokens = new Set(doc.tokens);
    uniqueTokens.forEach(token => {
      df[token] = (df[token] || 0) + 1;
    });
  });

  const numDocs = allDocs.length;

  // 2. Compute TF-IDF vectors for all documents
  const tfIdfVectors = {};
  allDocs.forEach(doc => {
    const tf = {};
    doc.tokens.forEach(token => {
      tf[token] = (tf[token] || 0) + 1;
    });

    const vector = {};
    const totalTokens = doc.tokens.length || 1;

    for (const term in tf) {
      // Normalized Term Frequency
      const termFreq = tf[term] / totalTokens;
      // Inverse Document Frequency with Laplace smoothing
      const idf = Math.log((numDocs + 1) / (df[term] + 1)) + 1;
      vector[term] = termFreq * idf;
    }

    tfIdfVectors[doc.id] = vector;
  });

  // 3. Compute cosine similarity against all other stories
  const targetVector = tfIdfVectors[storyId.toString()];
  if (!targetVector) return [];

  const similarities = [];
  allDocs.forEach(doc => {
    // Skip comparing the target story to itself
    if (doc.id === storyId.toString()) return;

    const sim = cosineSimilarity(targetVector, tfIdfVectors[doc.id]);
    similarities.push({
      story: doc.storyData,
      similarity: sim
    });
  });

  // Sort by similarity descending
  similarities.sort((a, b) => b.similarity - a.similarity);

  // Return the top N recommendations
  return similarities.slice(0, limit).map(item => item.story);
}

module.exports = {
  getRecommendations,
  tokenize,
  cosineSimilarity
};
