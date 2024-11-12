import { WikipediaArticle } from './types';

const ARXIV_API_URL = 'http://export.arxiv.org/api/query';

export const searchArxivPapers = async (query: string): Promise<WikipediaArticle[]> => {
  const searchQuery = `search_query=cat:cs.LG+OR+cat:cs.AI+AND+all:${query}&start=0&max_results=10`;
  
  try {
    const response = await fetch(`${ARXIV_API_URL}?${searchQuery}`);
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
        id: Date.now() + Math.random(),
        title: title,
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