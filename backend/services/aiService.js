/**
 * 🧠 Travel Blog AI Service
 * Implements a local NLP analyzer using:
 * 1. A Naive Bayes Classifier for travel categorization (Adventure, Luxury, Culture)
 * 2. TF-IDF & Heuristics for Keyword Extraction (AI Tags)
 * 3. Extractive Sentence Ranking for Summarization (AI Summary)
 */

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

// Basic tokenizer
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word));
}

// Training dataset for Naive Bayes Travel Classifier
const TRAINING_DATA = [
  // Adventure
  { category: 'adventure', text: 'climbing mountain summit snow-covered expedition trail trekking peaks rocks scale glacier safety guides altitude gear rope' },
  { category: 'adventure', text: 'scuba diving snorkeling reef fish coral underwater ocean sea marine turtle cavern cenotes diving sharks water wave' },
  { category: 'adventure', text: 'hiking walk trail path nature forest hills national park exploration wild backpack camping camping outdoors' },
  { category: 'adventure', text: 'adventure thrill extreme adrenaline skydiving rafting exploration river climb descent peak glacier' },
  
  // Luxury
  { category: 'luxury', text: 'luxury resort hotel stay suite villa private pool plunge pool lounge massage spa treatment beachfront massage sunset premium' },
  { category: 'luxury', text: 'private jet charter flight airport terminal FBO vip first class exclusive cabin champagne clouds luxury aviation fly' },
  { category: 'luxury', text: 'deluxe fine dining gourmet chef michelin star champagne caviar luxury wine tasting expensive organic high-end boutique' },
  { category: 'luxury', text: 'relax scenic escape luxury sanctuary exclusive service hospitality retreat butler massage beach' },

  // Culture
  { category: 'culture', text: 'historic site ancient landmark temple ruins castle museum heritage history archaeology tour guide statue architecture monument' },
  { category: 'culture', text: 'festival celebration carnival parade holiday parade local tradition dance music costumed fireworks community cultural' },
  { category: 'culture', text: 'art gallery museum painting pottery craft folklore exhibition theatre classical music perform history archive' },
  { category: 'culture', text: 'temple prayer spiritual monk pagoda shrine ritual incense blessing traditional culture sacred faith' }
];

class NaiveBayesClassifier {
  constructor() {
    this.vocabulary = new Set();
    this.docCount = {};
    this.wordCount = {};
    this.totalDocs = 0;
    this.train();
  }

  train() {
    TRAINING_DATA.forEach(doc => {
      const category = doc.category;
      const tokens = tokenize(doc.text);

      this.totalDocs++;
      this.docCount[category] = (this.docCount[category] || 0) + 1;

      if (!this.wordCount[category]) {
        this.wordCount[category] = { _total: 0 };
      }

      tokens.forEach(token => {
        this.vocabulary.add(token);
        this.wordCount[category][token] = (this.wordCount[category][token] || 0) + 1;
        this.wordCount[category]._total++;
      });
    });
  }

  classify(text) {
    const tokens = tokenize(text);
    let bestCategory = 'wanderlust';
    let bestScore = -Infinity;
    const scores = {};

    const categories = Object.keys(this.docCount);
    const vocabLength = this.vocabulary.size;

    categories.forEach(category => {
      // Prior probability P(Category)
      let logProbability = Math.log(this.docCount[category] / this.totalDocs);

      // Likelihood P(Token | Category) with Laplace Smoothing
      tokens.forEach(token => {
        if (this.vocabulary.has(token)) {
          const wordFreq = this.wordCount[category][token] || 0;
          const totalWords = this.wordCount[category]._total;
          logProbability += Math.log((wordFreq + 1) / (totalWords + vocabLength));
        }
      });

      scores[category] = logProbability;
      if (logProbability > bestScore) {
        bestScore = logProbability;
        bestCategory = category;
      }
    });

    return { category: bestCategory, scores };
  }
}

// Global classifier instance
const classifier = new NaiveBayesClassifier();

/**
 * AI Service Methods
 */

/**
 * 1. Categorize Story
 */
function getCategory(text) {
  const result = classifier.classify(text);
  return result.category;
}

/**
 * 2. Extract Tags (Keywords based on frequency & travel associations)
 */
function extractTags(text, limit = 5) {
  const tokens = tokenize(text);
  const frequencies = {};

  tokens.forEach(token => {
    frequencies[token] = (frequencies[token] || 0) + 1;
  });

  // Sort by frequency
  return Object.keys(frequencies)
    .sort((a, b) => frequencies[b] - frequencies[a])
    .slice(0, limit);
}

/**
 * 3. Generate Extractive Summary
 */
function generateSummary(text, maxSentences = 2) {
  if (!text) return '';
  
  // Sentence split
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  if (sentences.length <= maxSentences) {
    return sentences.join(' ').trim();
  }

  // Tokenize and calculate word weight
  const tokens = tokenize(text);
  const frequencies = {};
  tokens.forEach(token => {
    frequencies[token] = (frequencies[token] || 0) + 1;
  });

  // Score sentences based on word weights
  const sentenceScores = sentences.map((sentence, index) => {
    const words = tokenize(sentence);
    let score = 0;
    words.forEach(word => {
      score += frequencies[word] || 0;
    });
    // Normalize by length to avoid bias towards extremely long sentences
    const normalizedScore = words.length > 0 ? score / words.length : 0;
    return { sentence, index, score: normalizedScore };
  });

  // Sort by score and take top, then re-sort by index to keep original order
  const topSentences = sentenceScores
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSentences)
    .sort((a, b) => a.index - b.index)
    .map(item => item.sentence.trim());

  return topSentences.join(' ');
}

/**
 * Main AI Analysis API
 */
function analyzeStory(text) {
  return {
    summary: generateSummary(text),
    category: getCategory(text),
    tags: extractTags(text)
  };
}

module.exports = {
  analyzeStory,
  getCategory,
  extractTags,
  generateSummary
};
