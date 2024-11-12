import { useState, useCallback } from 'react';
import { searchArxivPapers } from "../services/arxivService";
import { getRandomArticles, getRelatedArticles } from "../services/wikipediaService";
import { WikipediaArticle } from '../services/types';

export const useContentLoader = (currentArticle: WikipediaArticle | null) => {
  const [isLoading, setIsLoading] = useState(false);

  const loadMoreContent = useCallback(async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      let newContent;
      
      const isCurrentArxiv = currentArticle?.title?.includes("arXiv");
      
      if (currentArticle) {
        if (isCurrentArxiv) {
          const tags = currentArticle.tags || [];
          if (tags.length > 0) {
            const searchQuery = tags.join(" OR ");
            newContent = await searchArxivPapers(searchQuery);
            if (!newContent || newContent.length === 0) {
              newContent = await searchArxivPapers("");
            }
          } else {
            newContent = await searchArxivPapers("");
          }
        } else {
          newContent = await getRelatedArticles(currentArticle);
          if (!newContent || newContent.length === 0) {
            newContent = await getRandomArticles(3);
          }
        }
      } else {
        const randomChoice = Math.random() > 0.5;
        newContent = randomChoice 
          ? await searchArxivPapers("")
          : await getRandomArticles(3);
      }
      
      return newContent;
    } catch (error) {
      console.error("Failed to load more content", error);
      return await getRandomArticles(3);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, currentArticle]);

  return { loadMoreContent, isLoading };
};