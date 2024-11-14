import { WikipediaPage, WikipediaArticle } from './types';
import { getPageViews } from './wikipediaApi';
import { getArticleImage } from './imageService';

export const transformToArticle = async (page: WikipediaPage): Promise<WikipediaArticle | null> => {
  try {
    const views = await getPageViews(page.title);
    
    // Get image URL - handle both direct pageimages and manual image fetching
    let image = page.thumbnail?.source;
    if (!image) {
      image = await getArticleImage(page);
    }
    
    // Skip articles with placeholder images or no images
    if (!image || image.includes('data:image/svg') || image.includes('placeholder')) {
      return null;
    }
    
    // Ensure image URL uses HTTPS
    if (image.startsWith('http:')) {
      image = image.replace('http:', 'https:');
    }
    
    return {
      id: page.pageid.toString(),
      title: page.title,
      content: page.extract || "No content available",
      image,
      citations: Math.floor(Math.random() * 300) + 50,
      readTime: Math.ceil((page.extract?.split(" ").length || 100) / 200),
      views,
      tags: page.categories?.slice(0, 4).map(cat => cat.title.replace("Category:", "")) || [],
      relatedArticles: [],
    };
  } catch (error) {
    console.error('Error transforming article:', error);
    return null;
  }
};