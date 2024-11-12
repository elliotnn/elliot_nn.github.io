import { BookOpen, Compass, BookText } from "lucide-react";
import { CreateAccountButton } from "./CreateAccountButton";
import { useNavigate } from "react-router-dom";

interface NavigationIconsProps {
  searchType: "wiki" | "arxiv";
  handleModeToggle: () => void;
  handleDiscoverClick: () => void;
  location: { pathname: string };
}

export const NavigationIcons = ({
  searchType,
  handleModeToggle,
  handleDiscoverClick,
  location,
}: NavigationIconsProps) => {
  const navigate = useNavigate();

  const handleCompassClick = () => {
    navigate('/discover');
  };

  return (
    <div className="flex items-center space-x-4">
      <BookOpen 
        className={`w-5 h-5 cursor-pointer transition-colors ${
          searchType === "arxiv" ? "text-wikitok-red" : "text-white"
        }`}
        onClick={handleModeToggle}
      />
      <BookText 
        className={`w-5 h-5 cursor-pointer transition-colors ${
          searchType === "arxiv" ? "text-wikitok-red" : "text-white"
        }`}
        onClick={handleModeToggle}
      />
      <Compass 
        className={`w-5 h-5 cursor-pointer transition-colors ${
          location.pathname === "/discover" ? "text-wikitok-red" : "text-white"
        }`}
        onClick={handleCompassClick}
      />
      <CreateAccountButton />
    </div>
  );
};