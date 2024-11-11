import { Button } from "./ui/button";
import ArticleAssistant from "./ArticleAssistant";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

const RightSidebar = ({ article }) => {
  const [showChat, setShowChat] = useState(false);

  const SidebarContent = () => (
    <div className="h-full flex flex-col justify-end pb-20">
      <div className="flex flex-col space-y-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="w-14 h-14"
          onClick={() => setShowChat(true)}
        >
          <span className="sr-only">Open chat</span>
          <svg
            className="w-6 h-6"
            fill="none"
            height="24"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </Button>
      </div>
    </div>
  );

  const ChatContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Article Assistant</h2>
        <Button variant="ghost" size="icon" onClick={() => setShowChat(false)}>
          <span className="sr-only">Close chat</span>
          <svg
            className="w-6 h-6"
            fill="none"
            height="24"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </Button>
      </div>
      <div className="flex-1 overflow-hidden">
        <ArticleAssistant article={article} />
      </div>
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