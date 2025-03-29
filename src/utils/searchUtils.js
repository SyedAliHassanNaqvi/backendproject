// Optimized Levenshtein Distance with O(n) space complexity
const levenshteinDistance = (str1, str2) => {
  const m = str1.length, n = str2.length;
  if (m === 0) return n;
  if (n === 0) return m;
  if (m < n) return levenshteinDistance(str2, str1); // Ensure str1 is the longer one

  let prevRow = Array(n + 1).fill(0).map((_, i) => i);
  let currRow = Array(n + 1).fill(0);

  for (let i = 1; i <= m; i++) {
    currRow[0] = i;
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        currRow[j] = prevRow[j - 1];
      } else {
        currRow[j] = 1 + Math.min(prevRow[j], currRow[j - 1], prevRow[j - 1]);
      }
    }
    [prevRow, currRow] = [currRow, prevRow]; // Swap rows
  }

  return prevRow[n];
};

// Check if two strings are similar based on Levenshtein distance
const areSimilar = (str1, str2, threshold = 2) => {
  str1 = str1.toLowerCase();
  str2 = str2.toLowerCase();

  if (str1 === str2) return true;
  if (Math.abs(str1.length - str2.length) > threshold) return false;

  return levenshteinDistance(str1, str2) <= threshold;
};

// Find similar words in a list based on string similarity
const findSimilarWords = (word, wordList, threshold = 2) => {
  return wordList.filter(w => areSimilar(word, w, threshold));
};

// Improved stemming function with better suffix handling
const simpleStem = (word) => {
  return word.toLowerCase()
    .replace(/(ing|ed|es|s|ly|er|est)$/g, '')  // General suffixes
    .replace(/(ational|tional)$/g, 'ate')      // "rational" → "rate"
    .replace(/(izer|ization)$/g, 'ize')        // "realization" → "realize"
    .replace(/(iveness|fulness|ousness)$/g, 'ive')  // "happiness" → "happy"
    .replace(/(icate|ative|alize)$/g, '')      // "activate" → "activ"
    .replace(/(ment|able|ible)$/g, '');        // "enjoyable" → "enjoy"
};

// Extract keywords from text efficiently
const extractKeywords = (text) => {
  if (!text) return [];

  const stopWordsSet = new Set([
    'the', 'and', 'or', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has',
    'had', 'do', 'does', 'did', 'but', 'if', 'then', 'else', 'when', 'up',
    'down', 'out', 'not', 'no', 'can', 'will', 'just', 'should', 'now'
  ]);

  const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
  const filteredWords = words.filter(word => word.length >= 3 && !stopWordsSet.has(word));

  return [...new Set(filteredWords.map(simpleStem))];
};

// Export functions
export {
  levenshteinDistance,
  areSimilar,
  findSimilarWords,
  simpleStem,
  extractKeywords
};
