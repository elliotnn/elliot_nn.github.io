import { Share2, ThumbsUp, MessageSquare, MessageCircle } from "lucide-react";
import { Button } from "./ui/button";
import ArticleAssistant from "./ArticleAssistant";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const RightSidebar = ({ article }) => {
  const [open, setOpen] = useState(false);

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
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full justify-start gap-2">
                <MessageCircle className="w-4 h-4" /> Chat
              </Button>
            </DialogTrigger>
            <DialogContent className="h-[80vh]">
              <DialogHeader>
                <DialogTitle>Chat about {article?.title}</DialogTitle>
              </DialogHeader>
              <ScrollArea className="h-full pr-4">
                <ArticleAssistant article={article} />
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;