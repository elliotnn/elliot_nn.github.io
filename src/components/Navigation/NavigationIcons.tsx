import { BookOpen, Compass, User } from "lucide-react";
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
    <div className="flex space-x-6">
      <BookOpen 
        className={`w-5 h-5 cursor-pointer transition-colors ${
          searchType === "arxiv" ? "text-wikitok-red" : "text-white"
        }`}
        onClick={handleModeToggle}
      />
      <User
        className="w-5 h-5 cursor-pointer text-white hover:text-wikitok-red transition-colors"
        onClick={handleAuthClick}
      />
      <Compass 
        className={`w-5 h-5 cursor-pointer transition-colors ${
          location.pathname === "/discover" ? "text-wikitok-red" : "text-white"
        }`}
        onClick={handleDiscoverClick}
      />
    </div>
  );
};