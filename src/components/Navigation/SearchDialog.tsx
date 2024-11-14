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
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  searchValue: string;
  setSearchValue: (value: string) => void;
  searchType: "wiki" | "arxiv";
}

export const SearchDialog = ({
  open,
  onOpenChange,
  searchValue,
  setSearchValue,
  searchType
}: SearchDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        <DialogTitle className="sr-only">
          Search {searchType === "wiki" ? "Wikipedia" : "arXiv ML Papers"}
        </DialogTitle>
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder={`Search ${searchType === "wiki" ? "Wikipedia" : "arXiv ML Papers"}...`}
            value={searchValue}
            onValueChange={setSearchValue}
            className="border-none focus:ring-0"
          />
          <CommandList>
            <CommandEmpty>Start typing to search...</CommandEmpty>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
};