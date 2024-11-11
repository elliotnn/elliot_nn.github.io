import { Share2, ThumbsUp, MessageSquare } from "lucide-react";
import { Button } from "./ui/button";
import ArticleAssistant from "./ArticleAssistant";

const RightSidebar = ({ article }) => {
  return (
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
        </div>
        
        <div className="border-t pt-6">
          <ArticleAssistant article={article} />
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;