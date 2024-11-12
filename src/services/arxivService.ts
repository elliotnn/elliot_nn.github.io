import { WikipediaArticle } from './types';

const ARXIV_API_URL = 'https://export.arxiv.org/api/query';

export const searchArxivPapers = async (query: string): Promise<WikipediaArticle[]> => {
  // Encode the query parameters properly
  const searchQuery = encodeURIComponent(`(cat:cs.LG OR cat:cs.AI) AND all:${query}`);
  const url = `${ARXIV_API_URL}?search_query=${searchQuery}&start=0&max_results=10&sortBy=submittedDate&sortOrder=descending`;
  
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
    
    return Array.from(entries).map((entry): WikipediaArticle => {
      const title = entry.getElementsByTagName("title")[0]?.textContent?.trim() || "";
      const summary = entry.getElementsByTagName("summary")[0]?.textContent?.trim() || "";
      const authors = Array.from(entry.getElementsByTagName("author"))
        .map(author => author.getElementsByTagName("name")[0]?.textContent || "")
        .join(", ");
      
      return {
        id: entry.getElementsByTagName("id")[0]?.textContent || `${Date.now()}-${Math.random()}`,
        title: title.replace(/\n/g, ' '),
        content: `${summary}\n\nAuthors: ${authors}`,
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/ArXiv_web.svg/1200px-ArXiv_web.svg.png",
        citations: Math.floor(Math.random() * 100),
        readTime: Math.ceil(summary.length / 1000),
        views: Math.floor(Math.random() * 10000),
        tags: ["machine-learning", "artificial-intelligence"],
        relatedArticles: [],
      };
    });
  } catch (error) {
    console.error('Error fetching arXiv papers:', error);
    return [];
  }
};