import { BookOpen, BookText, Compass, User } from "lucide-react";
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
  handleAuthClick,
  handleDiscoverClick
}: NavigationIconsProps) => {
  const location = useLocation();

  return (
    <div className="flex items-center gap-6">
      <div className="relative flex gap-2">
        <div className="absolute inset-0 bg-wikitok-red rounded-full scale-125" />
        <BookOpen 
          className={`w-6 h-6 cursor-pointer transition-colors relative z-10 text-white hover:text-wikitok-dark ${
            searchType === "arxiv" ? "text-wikitok-dark" : "text-white"
          }`}
          onClick={handleModeToggle}
        />
        <BookText 
          className="w-6 h-6 cursor-pointer transition-colors relative z-10 text-white hover:text-wikitok-dark"
          onClick={handleModeToggle}
        />
      </div>
      <User
        className="w-6 h-6 cursor-pointer text-white hover:text-wikitok-red transition-colors"
        onClick={handleAuthClick}
        aria-label="Account"
      />
      <Compass 
        className={`w-6 h-6 cursor-pointer transition-colors ${
          location.pathname === "/discover" ? "text-wikitok-red" : "text-white"
        }`}
        onClick={handleDiscoverClick}
      />
    </div>
  );
};