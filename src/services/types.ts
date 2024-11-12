export interface WikipediaArticle {
  id: string;  // Changed from number to string to accommodate arXiv IDs
  title: string;
  content: string;
  image: string;
  citations: number;
  readTime: number;
  views: number;
  tags: string[];
  relatedArticles: WikipediaArticle[];
}
