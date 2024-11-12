import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

export const NavigationLogo = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleRandomArticle = async () => {
    toast({
      title: "Loading random article",
      description: "Finding something interesting for you...",
      duration: 2000,
    });
    navigate('/');
  };

  return (
    <div 
      className="text-xl font-bold text-wikitok-red cursor-pointer"
      onClick={handleRandomArticle}
    >
      WikTok
    </div>
  );
};