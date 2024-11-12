import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { SearchDialog } from "./SearchDialog";
import { NavigationLogo } from "./NavigationLogo";
import { NavigationIcons } from "./NavigationIcons";
import { SearchBar } from "./SearchBar";
import { useToast } from "@/components/ui/use-toast";

const Navigation = () => {
  const [open, setOpen] = useState(false);
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
    <nav 
      className={`fixed top-0 left-0 right-0 h-14 z-50 flex items-center justify-between px-4 ${
        isDiscoverPage ? "bg-black" : "bg-black"
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <NavigationLogo />
      
      <SearchBar 
        searchValue={searchValue}
        onSearchClick={() => setOpen(true)}
      />
      
      <NavigationIcons 
        searchType={searchType}
        handleModeToggle={handleModeToggle}
        handleAuthClick={handleAuthClick}
        handleDiscoverClick={handleDiscoverClick}
      />

      <SearchDialog 
        open={open}
        onOpenChange={setOpen}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        searchType={searchType}
      />
    </nav>
  );
};

export default Navigation;