import { Share2, ThumbsUp, MessageSquare, MessageCircle, X } from "lucide-react";
import { Button } from "./ui/button";
import ArticleAssistant from "./ArticleAssistant";
import { useState } from "react";

const RightSidebar = ({ article }) => {
  const [showChat, setShowChat] = useState(false);

  const SidebarContent = () => (
    <div className="h-full flex flex-col justify-center pt-32">
      <div className="flex flex-col space-y-2">
        <Button 
          variant="ghost" 
          className="w-12 h-12 p-0 justify-center"
          onClick={() => setShowChat(true)}
        >
          <MessageCircle className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          className="w-12 h-12 p-0 justify-center"
        >
          <ThumbsUp className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          className="w-12 h-12 p-0 justify-center"
        >
          <MessageSquare className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          className="w-12 h-12 p-0 justify-center"
        >
          <Share2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  const ChatContent = () => (
    <div className="relative h-full">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-0 top-0"
        onClick={() => setShowChat(false)}
      >
        <X className="h-4 w-4" />
      </Button>
      <ArticleAssistant article={article} />
    </div>
  );

  return (
    <div className="fixed right-0 top-0 bottom-0 z-50">
      <div className={`h-full ${showChat ? 'md:w-[350px] sm:w-full bg-wikitok-dark border-l border-border p-4' : 'sm:w-16 bg-transparent'}`}>
        {showChat ? <ChatContent /> : <SidebarContent />}
      </div>
    </div>
  );
};

export default RightSidebar;