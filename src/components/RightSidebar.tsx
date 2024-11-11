import { Share2, ThumbsUp, MessageSquare, MessageCircle, X } from "lucide-react";
import { Button } from "./ui/button";
import ArticleAssistant from "./ArticleAssistant";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

const RightSidebar = ({ article }) => {
  const [showChat, setShowChat] = useState(false);

  const SidebarContent = () => (
    <div className="h-full flex flex-col justify-end">
      <div className="space-y-2 bg-black/20 backdrop-blur-sm p-4 rounded-lg">
        <Button variant="outline" className="w-full justify-start gap-2 sm:w-12 sm:h-12 sm:p-0 sm:justify-center">
          <ThumbsUp className="w-4 h-4" /> 
          <span className="hidden sm:hidden md:inline">Like</span>
        </Button>
        <Button variant="outline" className="w-full justify-start gap-2 sm:w-12 sm:h-12 sm:p-0 sm:justify-center">
          <MessageSquare className="w-4 h-4" />
          <span className="hidden sm:hidden md:inline">Comment</span>
        </Button>
        <Button variant="outline" className="w-full justify-start gap-2 sm:w-12 sm:h-12 sm:p-0 sm:justify-center">
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:hidden md:inline">Share</span>
        </Button>
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2 sm:w-12 sm:h-12 sm:p-0 sm:justify-center"
          onClick={() => setShowChat(true)}
        >
          <MessageCircle className="w-4 h-4" />
          <span className="hidden sm:hidden md:inline">Chat</span>
        </Button>
      </div>
    </div>
  );

  const ChatContent = () => (
    <div className="relative h-full">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-0 top-0 z-50"
        onClick={() => setShowChat(false)}
      >
        <X className="h-4 w-4" />
      </Button>
      <ArticleAssistant article={article} />
    </div>
  );

  return (
    <div className={`fixed right-0 top-0 bottom-0 md:w-[350px] sm:w-16 ${showChat ? 'bg-wikitok-dark border-l border-border p-4 z-50 sm:w-full' : 'bg-transparent'} overflow-hidden`}>
      {showChat ? <ChatContent /> : <SidebarContent />}
    </div>
  );
};

export default RightSidebar;