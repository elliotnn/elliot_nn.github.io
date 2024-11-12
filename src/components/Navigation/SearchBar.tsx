import { Search } from "lucide-react";

interface SearchBarProps {
  searchValue: string;
  onSearchClick: () => void;
}

export const SearchBar = ({ searchValue, onSearchClick }: SearchBarProps) => {
  return (
    <div 
      className="flex items-center bg-black/20 backdrop-blur-sm rounded-full px-4 py-2 cursor-pointer"
      onClick={onSearchClick}
    >
      <Search className="w-4 h-4 text-white/60 mr-2" />
      <span className="text-white/60 text-sm">
        {searchValue || "Search articles"}
      </span>
    </div>
  );
};