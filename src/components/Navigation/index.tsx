import { BookOpen, Compass, LogIn } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { SearchDialog } from "./SearchDialog";
import { useToast } from "@/components/ui/use-toast";

const Navigation = () => {
  const [searchValue, setSearchValue] = useState("");
  const [searchType, setSearchType] = useState<"wiki" | "arxiv">("wiki");
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const query = searchParams.get("q");
    if (query && location.pathname !== "/discover") {
      const decodedQuery = decodeURIComponent(query);
      setSearchValue(decodedQuery);
    }
  }, [searchParams, location.pathname]);

  const handleRandomArticle = async () => {
    setSearchValue("");
    toast({
      title: "Loading random article",
      description: "Finding something interesting for you...",
      duration: 2000,
    });
  };

  const handleDiscoverClick = () => {
    setSearchValue("");
    if (location.pathname === "/discover") {
      navigate("/");
    } else {
      navigate("/discover");
    }
  };

  const handleModeToggle = () => {
    const newMode = searchType === "wiki" ? "arxiv" : "wiki";
    setSearchType(newMode);
    navigate("/", { state: { mode: newMode, forceReload: true } });
  };

  const handleAuthClick = () => {
    navigate("/auth");
  };

  const isDiscoverPage = location.pathname === "/discover";

  return (
    <div className={`fixed top-0 left-0 right-0 h-14 z-50 flex items-center justify-between px-4 ${
      isDiscoverPage ? "bg-black" : "bg-black"
    }`}>
      <div 
        className="text-xl font-bold text-wikitok-red cursor-pointer"
        onClick={handleRandomArticle}
      >
        WikTok
      </div>
      
      <SearchDialog 
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        searchType={searchType}
      />
      
      <div className="flex space-x-6">
        <BookOpen 
          className={`w-5 h-5 cursor-pointer transition-colors ${
            searchType === "arxiv" ? "text-wikitok-red" : "text-white"
          }`}
          onClick={handleModeToggle}
        />
        <Compass 
          className={`w-5 h-5 cursor-pointer transition-colors ${
            location.pathname === "/discover" ? "text-wikitok-red" : "text-white"
          }`}
          onClick={handleDiscoverClick}
        />
        <LogIn
          className="w-5 h-5 cursor-pointer text-white hover:text-wikitok-red transition-colors"
          onClick={handleAuthClick}
        />
      </div>
    </div>
  );
};

export default Navigation;