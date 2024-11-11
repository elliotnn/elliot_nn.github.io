import { Share2, ThumbsUp, MessageSquare, MessageCircle } from "lucide-react";
import { Button } from "./ui/button";
import ArticleAssistant from "./ArticleAssistant";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

const RightSidebar = ({ article }) => {
  const [showChat, setShowChat] = useState(false);

  return (
    <>
      <div className="fixed right-0 top-0 bottom-0 w-[350px] bg-background border-l border-border p-4 pt-20 overflow-y-auto">
        <div className="space-y-6">
          <div className="flex flex-col gap-2">
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
              onClick={() => setShowChat(!showChat)}
            >
              <MessageCircle className="w-4 h-4" /> Chat
            </Button>
          </div>
        </div>
      </div>
      
      {showChat && (
        <div className="fixed right-[350px] top-0 bottom-0 w-[400px] bg-wikitok-dark border-l border-border p-4 pt-20 overflow-hidden animate-in slide-in-from-right duration-300">
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Chat about {article?.title}</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowChat(false)}
              >
                ×
              </Button>
            </div>
            <ScrollArea className="flex-1 pr-4">
              <ArticleAssistant article={article} />
            </ScrollArea>
          </div>
        </div>
      )}
    </>
  );
};

export default RightSidebar;