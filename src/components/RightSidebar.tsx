import { Share2, ThumbsUp, MessageSquare, MessageCircle, X, UserPlus } from "lucide-react";
import { Button } from "./ui/button";
import ArticleAssistant from "./ArticleAssistant";
import { useState } from "react";
import { useToast } from "./ui/use-toast";
import { useNavigate } from "react-router-dom";

const RightSidebar = ({ article }) => {
  const [showChat, setShowChat] = useState(false);
  const [liked, setLiked] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLike = () => {
    setLiked(!liked);
    toast({
      title: liked ? "Removed like" : "Added like",
      description: liked ? "You've removed your like" : "You've liked this article",
      duration: 2000,
    });
  };

  const handleComment = () => {
    toast({
      title: "Comments",
      description: "Comments feature coming soon!",
      duration: 2000,
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "Article link copied to clipboard",
      duration: 2000,
    });
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col justify-center pt-32">
      <div className="flex flex-col space-y-2">
        <Button 
          variant="ghost" 
          className="w-12 h-12 p-0 justify-center hover:text-wikitok-blue"
          onClick={() => navigate('/auth')}
        >
          <UserPlus className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          className="w-12 h-12 p-0 justify-center hover:text-wikitok-blue"
          onClick={() => setShowChat(true)}
        >
          <MessageCircle className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          className={`w-12 h-12 p-0 justify-center hover:text-wikitok-blue ${liked ? 'text-wikitok-blue' : ''}`}
          onClick={handleLike}
        >
          <ThumbsUp className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          className="w-12 h-12 p-0 justify-center hover:text-wikitok-blue"
          onClick={handleComment}
        >
          <MessageSquare className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          className="w-12 h-12 p-0 justify-center hover:text-wikitok-blue"
          onClick={handleShare}
        >
          <Share2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  const ChatContent = () => (
    <div className="relative h-full bg-gradient-to-b from-wikitok-blue/5 to-wikitok-dark">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-4 z-10 hover:text-wikitok-blue"
        onClick={() => setShowChat(false)}
      >
        <X className="h-4 w-4" />
      </Button>
      <ArticleAssistant article={article} />
    </div>
  );

  return (
    <div className="fixed right-0 top-0 bottom-0 z-50">
      <div className={`h-screen ${showChat ? 'w-screen md:w-[450px] bg-wikitok-dark border-l border-wikitok-blue/20' : 'sm:w-16 bg-transparent'}`}>
        {showChat ? <ChatContent /> : <SidebarContent />}
      </div>
    </div>
  );
};

export default RightSidebar;