import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Progress } from "./ui/progress";
import { getRandomArticles, getRelatedArticles } from "../services/wikipediaService";

const ArticleViewer = ({ articles: initialArticles, onArticleChange }) => {
  const [articles, setArticles] = useState(initialArticles);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const currentArticle = articles[currentIndex];

  const loadMoreArticles = useCallback(async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      // Get related articles based on the current article
      const newArticles = currentArticle 
        ? await getRelatedArticles(currentArticle)
        : await getRandomArticles(3);
      setArticles(prev => [...prev, ...newArticles]);
    } catch (error) {
      console.error("Failed to load more articles", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, currentArticle]);

  useEffect(() => {
    setIsVisible(true);
    setDisplayedText("");
    setProgress(0);
    onArticleChange(currentArticle);

    if (currentIndex >= articles.length - 2) {
      loadMoreArticles();
    }
  }, [currentIndex, currentArticle, onArticleChange, articles.length, loadMoreArticles]);

  useEffect(() => {
    if (!isVisible || !currentArticle?.content) return;

    let currentChar = 0;
    const text = currentArticle.content;
    const totalChars = text.length;

    const interval = setInterval(() => {
      if (currentChar <= totalChars) {
        setDisplayedText(text.slice(0, currentChar));
        setProgress((currentChar / totalChars) * 100);
        currentChar++;
        
        // Scroll to bottom when new text is added
        if (textContainerRef.current) {
          textContainerRef.current.scrollTop = textContainerRef.current.scrollHeight;
        }
      } else {
        clearInterval(interval);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [isVisible, currentArticle?.content]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute("data-index") || "0");
            setCurrentIndex(index);
            setIsVisible(true);
          }
        });
      },
      {
        threshold: 0.7,
        root: null,
      }
    );

    const articleElements = container.querySelectorAll(".article-section");
    articleElements.forEach((article) => observer.observe(article));

    return () => {
      articleElements.forEach((article) => observer.unobserve(article));
    };
  }, [articles]);

  return (
    <main 
      ref={containerRef} 
      className="h-screen w-screen overflow-y-scroll snap-y snap-mandatory"
    >
      {articles.map((article, index) => (
        <div 
          key={article.id} 
          data-index={index}
          className="article-section h-screen w-screen snap-start snap-always relative flex items-center justify-center"
        >
          <div className="absolute inset-0 w-screen h-screen">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: isVisible && currentIndex === index ? 1 : 0,
              y: isVisible && currentIndex === index ? 0 : 20,
            }}
            transition={{ duration: 0.5 }}
            className="absolute bottom-0 left-0 right-0 flex flex-col"
          >
            {/* Fixed title section */}
            <div className="px-8 pt-6 pb-4 z-20">
              <h1 className="text-4xl font-bold mb-2">{article.title}</h1>
            </div>

            {/* Scrollable content section */}
            <div 
              ref={textContainerRef}
              className="max-h-[50vh] overflow-y-auto px-8 pb-8 flex flex-col-reverse"
            >
              <div>
                <p className="text-lg leading-loose mb-6 py-2">
                  {currentIndex === index ? displayedText : article.content}
                </p>
                <div className="flex items-center space-x-2 text-sm text-gray-300 mt-4">
                  <span>{article.readTime} min read</span>
                  <span>•</span>
                  <span>{article.views.toLocaleString()} views</span>
                </div>
              </div>
            </div>
          </motion.div>
          
          {currentIndex === index && (
            <div className="absolute bottom-0 left-0 right-0 z-20">
              <Progress 
                value={progress} 
                className="h-1 bg-black/20"
                indicatorClassName="bg-red-500"
              />
            </div>
          )}
        </div>
      ))}
      {isLoading && (
        <div className="h-screen w-screen flex items-center justify-center">
          <div className="text-white">Loading more articles...</div>
        </div>
      )}
    </main>
  );
};

export default ArticleViewer;