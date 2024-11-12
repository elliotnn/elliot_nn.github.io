import { User, UserPlus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const UserActions = ({ handleAuthClick }: { handleAuthClick: () => void }) => {
  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="ghost" 
        size="icon"
        className="text-white hover:text-wikitok-red hidden md:flex"
        onClick={handleAuthClick}
      >
        <UserPlus className="w-5 h-5" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-white hover:text-wikitok-red bg-wikitok-red/10 hover:bg-wikitok-red/20"
          >
            <User className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-black/90 backdrop-blur-sm border-wikitok-red/20">
          <DropdownMenuItem onClick={handleAuthClick} className="text-white hover:text-wikitok-red hover:bg-wikitok-red/10">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleAuthClick} className="text-white hover:text-wikitok-red hover:bg-wikitok-red/10">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};