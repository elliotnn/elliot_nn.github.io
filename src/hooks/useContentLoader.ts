import { useState, useCallback, useEffect } from 'react';
import { searchArxivPapers } from "../services/arxivService";
import { getRandomArticles, getRelatedArticles } from "../services/wikipediaService";
import { WikipediaArticle } from '../services/types';

export const useContentLoader = (currentArticle: WikipediaArticle | null) => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastSearchQuery, setLastSearchQuery] = useState("");
  const [previousMode, setPreviousMode] = useState<'wiki' | 'arxiv'>(
    currentArticle?.title?.includes("arXiv") ? 'arxiv' : 'wiki'
  );

  const loadMoreContent = useCallback(async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      let newContent;
      
      const isCurrentArxiv = currentArticle?.title?.includes("arXiv");
      const modeChanged = isCurrentArxiv !== (previousMode === 'arxiv');
      setPreviousMode(isCurrentArxiv ? 'arxiv' : 'wiki');
      
      if (currentArticle) {
        if (isCurrentArxiv) {
          const tags = currentArticle.tags || [];
          let searchQuery = "";
          
          if (tags.length > 0 && !modeChanged) {
            const availableTags = tags.filter(tag => !lastSearchQuery.includes(tag));
            if (availableTags.length > 0) {
              searchQuery = availableTags[Math.floor(Math.random() * availableTags.length)];
            }
          }
          
          setLastSearchQuery(searchQuery);
          newContent = await searchArxivPapers(searchQuery);
          
          if (!newContent || newContent.length === 0) {
            newContent = await searchArxivPapers("");
          }
        } else {
          if (modeChanged) {
            newContent = await getRandomArticles(3);
          } else {
            newContent = await getRelatedArticles(currentArticle);
            if (!newContent || newContent.length === 0) {
              newContent = await getRandomArticles(3);
            }
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
  }, [isLoading, currentArticle, lastSearchQuery, previousMode]);

  // Trigger content reload when mode changes
  useEffect(() => {
    const isCurrentArxiv = currentArticle?.title?.includes("arXiv");
    const modeChanged = isCurrentArxiv !== (previousMode === 'arxiv');
    
    if (modeChanged) {
      loadMoreContent();
    }
  }, [currentArticle, previousMode, loadMoreContent]);

  return { loadMoreContent, isLoading };
};