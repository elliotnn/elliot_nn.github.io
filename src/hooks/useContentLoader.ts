import { useState, useCallback } from 'react';
import { searchArxivPapers } from "../services/arxivService";
import { getRandomArticles, getRelatedArticles } from "../services/wikipediaService";
import { WikipediaArticle } from '../services/types';

export const useContentLoader = (currentArticle: WikipediaArticle | null) => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastSearchQuery, setLastSearchQuery] = useState("");

  const loadMoreContent = useCallback(async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      let newContent;
      
      const isCurrentArxiv = currentArticle?.title?.includes("arXiv");
      
      if (currentArticle) {
        if (isCurrentArxiv) {
          const tags = currentArticle.tags || [];
          let searchQuery = "";
          
          if (tags.length > 0) {
            // Generate a different search query than the last one
            const availableTags = tags.filter(tag => !lastSearchQuery.includes(tag));
            if (availableTags.length > 0) {
              searchQuery = availableTags[Math.floor(Math.random() * availableTags.length)];
            } else {
              // If we've used all tags, get random papers
              searchQuery = "";
            }
          }
          
          setLastSearchQuery(searchQuery);
          newContent = await searchArxivPapers(searchQuery);
          
          if (!newContent || newContent.length === 0) {
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
  }, [isLoading, currentArticle, lastSearchQuery]);

  return { loadMoreContent, isLoading };
};