import { WikipediaArticle } from './types';

const ARXIV_API_URL = 'https://export.arxiv.org/api/query';

// Cache for storing API responses
const cache = new Map<string, { data: WikipediaArticle[], timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const API_RATE_LIMIT = 3000; // 3 seconds between requests
let lastRequestTime = 0;

export const searchArxivPapers = async (query: string): Promise<WikipediaArticle[]> => {
  // Check cache first
  const cacheKey = query.toLowerCase();
  const cachedData = cache.get(cacheKey);
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    return cachedData.data;
  }

  // Respect rate limiting
  const now = Date.now();
  const timeToWait = Math.max(0, API_RATE_LIMIT - (now - lastRequestTime));
  if (timeToWait > 0) {
    await new Promise(resolve => setTimeout(resolve, timeToWait));
  }
  lastRequestTime = Date.now();

  // Construct a more comprehensive search query
  const searchTerms = query.split(' ').map(term => `all:"${term}"`).join(' AND ');
  const searchQuery = encodeURIComponent(`(cat:cs.LG OR cat:cs.AI OR cat:cs.CL) AND (${searchTerms})`);
  const url = `${ARXIV_API_URL}?search_query=${searchQuery}&start=0&max_results=20&sortBy=relevance&sortOrder=descending`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`ArXiv API error: ${response.status}`);
    }
    
    const data = await response.text();
    
    // Parse XML response
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, "text/xml");
    const entries = xmlDoc.getElementsByTagName("entry");
    
    const articles = Array.from(entries).map((entry): WikipediaArticle => {
      const title = entry.getElementsByTagName("title")[0]?.textContent?.trim() || "";
      const summary = entry.getElementsByTagName("summary")[0]?.textContent?.trim() || "";
      const authors = Array.from(entry.getElementsByTagName("author"))
        .map(author => author.getElementsByTagName("name")[0]?.textContent || "")
        .join(", ");
      const id = entry.getElementsByTagName("id")[0]?.textContent || `arxiv-${Date.now()}-${Math.random()}`;
      const categories = Array.from(entry.getElementsByTagName("category"))
        .map(cat => cat.getAttribute("term") || "")
        .filter(Boolean);
      
      return {
        id,
        title: title.replace(/\n/g, ' '),
        content: `${summary}\n\nAuthors: ${authors}`,
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/ArXiv_web.svg/1200px-ArXiv_web.svg.png",
        citations: Math.floor(Math.random() * 100),
        readTime: Math.ceil(summary.length / 1000),
        views: Math.floor(Math.random() * 10000),
        tags: categories,
        relatedArticles: [],
      };
    });

    // Cache the results
    cache.set(cacheKey, { data: articles, timestamp: Date.now() });
    
    return articles;
  } catch (error) {
    console.error('Error fetching arXiv papers:', error);
    return [];
  }
};