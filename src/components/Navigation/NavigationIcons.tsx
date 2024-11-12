import { BookOpen, BookText, Compass } from "lucide-react";
import { useLocation } from "react-router-dom";

interface NavigationIconsProps {
  searchType: "wiki" | "arxiv";
  handleModeToggle: () => void;
  handleAuthClick: () => void;
  handleDiscoverClick: () => void;
}

export const NavigationIcons = ({
  searchType,
  handleModeToggle,
  handleDiscoverClick
}: NavigationIconsProps) => {
  const location = useLocation();

  return (
    <div className="flex items-center gap-6">
      <div className="relative flex items-center gap-2 bg-wikitok-red/10 px-3 py-1.5 rounded-full">
        <BookOpen 
          className={`w-5 h-5 cursor-pointer transition-colors relative z-10 ${
            searchType === "arxiv" ? "text-wikitok-red" : "text-white"
          }`}
          onClick={handleModeToggle}
        />
        <BookText 
          className={`w-5 h-5 cursor-pointer transition-colors relative z-10 ${
            searchType === "wiki" ? "text-wikitok-red" : "text-white"
          }`}
          onClick={handleModeToggle}
        />
      </div>
      
      <Compass 
        className={`w-5 h-5 cursor-pointer transition-colors ${
          location.pathname === "/discover" ? "text-wikitok-red" : "text-white"
        }`}
        onClick={handleDiscoverClick}
      />
    </div>
  );
};