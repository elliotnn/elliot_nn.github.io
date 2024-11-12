import { useState, useEffect, useRef } from "react";
import { useContentLoader } from "../hooks/useContentLoader";
import { ArticleContent } from "./ArticleContent";

const ArticleViewer = ({ articles: initialArticles, onArticleChange }) => {
  const [articles, setArticles] = useState(initialArticles);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const currentArticle = articles[currentIndex];
  
  const { loadMoreContent, isLoading } = useContentLoader(currentArticle);

  useEffect(() => {
    setIsVisible(true);
    setDisplayedText("");
    setProgress(0);
    onArticleChange(currentArticle);

    if (currentIndex >= articles.length - 2) {
      loadMoreContent().then(newContent => {
        if (newContent) {
          setArticles(prev => [...prev, ...newContent]);
        }
      });
    }
  }, [currentIndex, currentArticle, onArticleChange, articles.length, loadMoreContent]);

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
        <ArticleContent
          key={article.id}
          article={article}
          isVisible={isVisible}
          currentIndex={currentIndex}
          index={index}
          displayedText={displayedText}
          progress={progress}
          textContainerRef={textContainerRef}
        />
      ))}
      {isLoading && (
        <div className="h-screen w-screen flex items-center justify-center">
          <div className="text-white">Loading more content...</div>
        </div>
      )}
    </main>
  );
};

export default ArticleViewer;