import { Search } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchArticles } from "../../services/wikipediaService";
import { searchArxivPapers } from "../../services/arxivService";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";

interface SearchDialogProps {
  searchValue: string;
  setSearchValue: (value: string) => void;
  searchType: "wiki" | "arxiv";
}

export const SearchDialog = ({ searchValue, setSearchValue, searchType }: SearchDialogProps) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: wikiResults, isLoading: wikiLoading } = useQuery({
    queryKey: ["wiki-search", searchValue],
    queryFn: () => searchArticles(searchValue),
    enabled: searchValue.length > 0 && searchType === "wiki",
    gcTime: 1000 * 60 * 5,
    staleTime: 0,
  });

  const { data: arxivResults, isLoading: arxivLoading } = useQuery({
    queryKey: ["arxiv-search", searchValue],
    queryFn: () => searchArxivPapers(searchValue),
    enabled: searchValue.length > 0 && searchType === "arxiv",
    gcTime: 1000 * 60 * 5,
    staleTime: 0,
  });

  const handleArticleSelect = (title: string, selectedArticle: any) => {
    setOpen(false);
    setSearchValue(title);
    toast({
      title: "Loading articles",
      description: `Loading articles about ${title}...`,
      duration: 2000,
    });
    
    const currentResults = searchType === "wiki" ? wikiResults : arxivResults;
    const reorderedResults = [
      selectedArticle,
      ...(currentResults || []).filter(article => article.id !== selectedArticle.id)
    ];
    
    navigate(`/?q=${encodeURIComponent(title)}`, {
      state: { reorderedResults, mode: searchType }
    });
  };

  const isLoading = searchType === "wiki" ? wikiLoading : arxivLoading;
  const searchResults = searchType === "wiki" ? wikiResults : arxivResults;

  return (
    <>
      <div 
        className="flex items-center bg-black/20 backdrop-blur-sm rounded-full px-4 py-2 cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <Search className="w-4 h-4 text-white/60 mr-2" />
        <span className="text-white/60 text-sm">
          {searchValue || "Search articles"}
        </span>
      </div>

      <CommandDialog 
        open={open} 
        onOpenChange={(newOpen) => {
          setOpen(newOpen);
          if (!newOpen) setSearchValue("");
        }}
      >
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder={`Search ${searchType === "wiki" ? "Wikipedia" : "arXiv ML Papers"}...`}
            value={searchValue}
            onValueChange={setSearchValue}
            className="border-none focus:ring-0"
          />
          <CommandList className="max-h-[80vh] overflow-y-auto">
            {isLoading && (
              <CommandEmpty>Searching...</CommandEmpty>
            )}
            {!isLoading && !searchResults && searchValue.length > 0 && (
              <CommandEmpty>No results found.</CommandEmpty>
            )}
            {!isLoading && !searchValue && (
              <CommandEmpty>Start typing to search articles</CommandEmpty>
            )}
            {!isLoading && searchResults && searchResults.length === 0 && (
              <CommandEmpty>No results found.</CommandEmpty>
            )}
            {!isLoading && searchResults && searchResults.length > 0 && (
              <CommandGroup heading={searchType === "wiki" ? "Wikipedia Articles" : "arXiv Papers"}>
                {searchResults.map((result) => (
                  <CommandItem
                    key={result.id}
                    onSelect={() => handleArticleSelect(result.title, result)}
                    className="flex items-center p-2 cursor-pointer hover:bg-accent rounded-lg"
                  >
                    <div className="flex items-center w-full gap-3">
                      {result.image && (
                        <img 
                          src={result.image} 
                          alt={result.title}
                          className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-base">{result.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {result.content}
                        </div>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
};