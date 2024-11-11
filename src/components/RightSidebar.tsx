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
        <Button variant="outline" className="w-full justify-start gap-2">
          <ThumbsUp className="w-4 h-4" /> Like
        </Button>
        <Button variant="outline" className="w-full justify-start gap-2">
          <MessageSquare className="w-4 h-4" /> Comment
        </Button>
        <Button variant="outline" className="w-full justify-start gap-2">
          <Share2 className="w-4 h-4" /> Share
        </Button>
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2"
          onClick={() => setShowChat(true)}
        >
          <MessageCircle className="w-4 h-4" /> Chat
        </Button>
      </div>
    </div>
  );

  const ChatContent = () => (
    <ArticleAssistant article={article} />
  );

  return (
    <div className={`fixed right-0 top-0 bottom-0 w-[350px] ${showChat ? 'bg-wikitok-dark border-l border-border p-4 z-50' : 'bg-transparent'} overflow-hidden`}>
      {showChat ? <ChatContent /> : <SidebarContent />}
    </div>
  );
};

export default RightSidebar;