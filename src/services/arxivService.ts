import { WikipediaArticle } from './types';

const ARXIV_API_URL = 'https://export.arxiv.org/api/query';

const cache = new Map<string, { data: WikipediaArticle[], timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000;
const API_RATE_LIMIT = 3000;
let lastRequestTime = 0;

// Known highly cited papers and their approximate citations
const KNOWN_PAPERS: Record<string, number> = {
  "attention is all you need": 100000,
  "bert: pre-training of deep bidirectional transformers for language understanding": 80000,
  "deep residual learning for image recognition": 90000,
  "adam: a method for stochastic optimization": 70000,
  "imagenet classification with deep convolutional neural networks": 85000,
};

const calculateRelevanceScore = (title: string, summary: string, query: string) => {
  const searchTerms = query.toLowerCase().split(' ');
  let score = 0;

  searchTerms.forEach(term => {
    if (title.toLowerCase().includes(term)) score += 3;
    if (summary.toLowerCase().includes(term)) score += 1;
  });

  return score;
};

const estimateCitations = (title: string, publishDate: string) => {
  const normalizedTitle = title.toLowerCase();
  
  // Check if it's a known highly-cited paper
  for (const [knownTitle, citations] of Object.entries(KNOWN_PAPERS)) {
    if (normalizedTitle.includes(knownTitle)) {
      return citations;
    }
  }

  // For other papers, estimate based on age
  const publicationYear = new Date(publishDate).getFullYear();
  const currentYear = new Date().getFullYear();
  const yearsOld = currentYear - publicationYear;
  
  // Base citation count that grows with paper age
  return Math.floor(Math.random() * (500 * yearsOld) + 100);
};

const calculatePopularityScore = (citations: number) => {
  // Normalize citations on a logarithmic scale
  return Math.log10(citations + 1) / Math.log10(100000);
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
      const publishDate = entry.getElementsByTagName("published")[0]?.textContent || new Date().toISOString();
      const categories = Array.from(entry.getElementsByTagName("category"))
        .map(cat => cat.getAttribute("term") || "")
        .filter(Boolean);
      
      const citations = estimateCitations(title, publishDate);
      const relevanceScore = calculateRelevanceScore(title, summary, query);
      const popularityScore = calculatePopularityScore(citations);
      const views = Math.floor(citations * 50); // Estimate views based on citations

      const article: WikipediaArticle = {
        id,
        title: title.replace(/\n/g, ' '),
        content: `${summary}\n\nAuthors: ${authors}`,
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/ArXiv_web.svg/1200px-ArXiv_web.svg.png",
        citations,
        readTime: Math.ceil(summary.length / 1000),
        views,
        tags: categories,
        relatedArticles: [],
      };

      return article;
    });

    // Sort articles based on combined score
    const sortedArticles = articles.sort((a, b) => {
      const scoreA = (calculateRelevanceScore(a.title, a.content, query) * 0.6) + 
                    (calculatePopularityScore(a.citations) * 0.4);
      const scoreB = (calculateRelevanceScore(b.title, b.content, query) * 0.6) + 
                    (calculatePopularityScore(b.citations) * 0.4);
      return scoreB - scoreA;
    });

    cache.set(cacheKey, { data: sortedArticles, timestamp: Date.now() });
    return sortedArticles;
  } catch (error) {
    console.error('Error fetching arXiv papers:', error);
    return [];
  }
};