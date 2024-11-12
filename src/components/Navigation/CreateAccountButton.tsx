import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const CreateAccountButton = () => {
  const navigate = useNavigate();
  
  return (
    <Button 
      variant="ghost" 
      size="icon"
      className="text-white hover:text-wikitok-red bg-wikitok-red/10 hover:bg-wikitok-red/20"
      onClick={() => navigate('/auth')}
    >
      <UserPlus className="w-5 h-5" />
    </Button>
  );
};