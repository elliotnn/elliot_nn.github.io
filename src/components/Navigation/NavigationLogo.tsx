import { useToast } from "@/components/ui/use-toast";

export const NavigationLogo = () => {
  const { toast } = useToast();

  const handleRandomArticle = async () => {
    toast({
      title: "Loading random article",
      description: "Finding something interesting for you...",
      duration: 2000,
    });
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