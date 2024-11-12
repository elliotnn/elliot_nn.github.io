import { WikipediaArticle } from './types';

const ARXIV_API_URL = 'https://export.arxiv.org/api/query';

const cache = new Map<string, { data: WikipediaArticle[], timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000;
const API_RATE_LIMIT = 3000;
let lastRequestTime = 0;

// Calculate relevance score based on how well the title and summary match the query
const calculateRelevanceScore = (title: string, summary: string, query: string) => {
  const searchTerms = query.toLowerCase().split(' ');
  let score = 0;

  // Title matches are weighted more heavily
  searchTerms.forEach(term => {
    if (title.toLowerCase().includes(term)) score += 3;
    if (summary.toLowerCase().includes(term)) score += 1;
  });

  return score;
};

// Calculate popularity score based on citations and views
const calculatePopularityScore = (citations: number, views: number) => {
  // Normalize citations and views to a 0-1 scale
  const normalizedCitations = Math.min(citations / 1000, 1);
  const normalizedViews = Math.min(views / 10000, 1);
  
  return (normalizedCitations * 0.7) + (normalizedViews * 0.3);
};

export const searchArxivPapers = async (query: string): Promise<WikipediaArticle[]> => {
  const cacheKey = query.toLowerCase();
  const cachedData = cache.get(cacheKey);
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    return cachedData.data;
  }

  const now = Date.now();
  const timeToWait = Math.max(0, API_RATE_LIMIT - (now - lastRequestTime));
  if (timeToWait > 0) {
    await new Promise(resolve => setTimeout(resolve, timeToWait));
  }
  lastRequestTime = Date.now();

  const searchTerms = query.split(' ').map(term => `all:"${term}"`).join(' AND ');
  const searchQuery = encodeURIComponent(`(cat:cs.LG OR cat:cs.AI OR cat:cs.CL) AND (${searchTerms})`);
  const url = `${ARXIV_API_URL}?search_query=${searchQuery}&start=0&max_results=20&sortBy=relevance&sortOrder=descending`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`ArXiv API error: ${response.status}`);
    }
    
    const data = await response.text();
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
      
      // Generate random citations and views for demonstration
      const citations = Math.floor(Math.random() * 1000);
      const views = Math.floor(Math.random() * 10000);

      return {
        id,
        title: title.replace(/\n/g, ' '),
        content: `${summary}\n\nAuthors: ${authors}`,
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/ArXiv_web.svg/1200px-ArXiv_web.svg.png",
        citations,
        readTime: Math.ceil(summary.length / 1000),
        views,
        tags: categories,
        relatedArticles: [],
        relevanceScore: calculateRelevanceScore(title, summary, query),
        popularityScore: calculatePopularityScore(citations, views)
      };
    });

    // Sort articles based on combined score
    const sortedArticles = articles.sort((a, b) => {
      const scoreA = (a.relevanceScore * 0.6) + (a.popularityScore * 0.4);
      const scoreB = (b.relevanceScore * 0.6) + (b.popularityScore * 0.4);
      return scoreB - scoreA;
    });

    cache.set(cacheKey, { data: sortedArticles, timestamp: Date.now() });
    return sortedArticles;
  } catch (error) {
    console.error('Error fetching arXiv papers:', error);
    return [];
  }
};