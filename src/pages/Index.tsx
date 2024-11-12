import { useQuery } from "@tanstack/react-query";
import ArticleViewer from "../components/ArticleViewer";
import RightSidebar from "../components/RightSidebar";
import LeftSidebar from "../components/LeftSidebar";
import { getRandomArticles, searchArticles } from "../services/wikipediaService";
import { searchArxivPapers } from "../services/arxivService";
import { useToast } from "@/components/ui/use-toast";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const Index = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const searchQuery = searchParams.get("q");
  const [currentArticle, setCurrentArticle] = useState(null);
  const currentMode = location.state?.mode || "wiki";
  const forceReload = location.state?.forceReload;

  const { data: articles, isLoading, error, refetch } = useQuery({
    queryKey: ["articles", searchQuery, currentMode],
    queryFn: async () => {
      let fetchedArticles;
      if (searchQuery) {
        if (location.state?.reorderedResults) {
          fetchedArticles = location.state.reorderedResults;
        } else {
          fetchedArticles = currentMode === "wiki" 
            ? await searchArticles(searchQuery)
            : await searchArxivPapers(searchQuery);
        }
      } else {
        fetchedArticles = currentMode === "wiki"
          ? await getRandomArticles(3)
          : await searchArxivPapers("");
      }
      return fetchedArticles.filter(article => article.image);
    },
    retry: 1,
  });

  useEffect(() => {
    if (forceReload) {
      refetch();
      navigate(location.pathname, { 
        state: { ...location.state, forceReload: false } 
      });
    }
  }, [forceReload, refetch, navigate, location]);

  const handleTagClick = (tag: string) => {
    navigate(`/?q=${encodeURIComponent(tag)}`);
  };

  if (error) {
    toast({
      title: "Error",
      description: "Failed to load articles. Please try again later.",
      variant: "destructive",
    });
  }

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-wikitok-dark">
        <div className="text-white">Loading amazing articles...</div>
      </div>
    );
  }

  if (error || !articles || articles.length === 0) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-wikitok-dark">
        <div className="text-white">Something went wrong. Please try again.</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      <div className="flex h-full">
        <LeftSidebar article={currentArticle || articles[0]} onTagClick={handleTagClick} />
        <ArticleViewer 
          articles={articles} 
          onArticleChange={setCurrentArticle}
        />
        <RightSidebar article={currentArticle || articles[0]} />
      </div>
    </div>
  );
};

export default Index;