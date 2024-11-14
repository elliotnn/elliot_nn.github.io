import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Send, Key, X } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Message } from "./chat/Message";
import { useChatAssistant } from "./chat/useChatAssistant";

const ArticleAssistant = ({ article, onClose }: { article: { title: string; content: string } | null, onClose: () => void }) => {
  const [question, setQuestion] = useState("");
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY; // Use the environment variable
  const { messages, isLoading, askQuestion, generateInitialQuestion } = useChatAssistant(article);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleStreamScroll = () => {
    requestAnimationFrame(scrollToBottom);
  };

  useEffect(() => {
    const scrollInterval = setInterval(handleStreamScroll, 100);
    
    return () => clearInterval(scrollInterval);
  }, [messages]);

  useEffect(() => {
    if (article && apiKey) {
      generateInitialQuestion(apiKey);
    }
  }, [article, apiKey]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!article || !question.trim() || !apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please provide both a question and an API key.",
        variant: "destructive",
      });
      return;
    }

    await askQuestion(question, apiKey);
    setQuestion("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!article) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] mt-14 relative">
      <div className="p-4 border-b border-border bg-wikitok-dark/50 backdrop-blur-sm sticky top-14 z-10 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-primary">{article.title}</h2>
          <p className="text-sm text-muted-foreground">Ask questions about this article</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="hover:bg-destructive/90 transition-colors"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[calc(100vh-14rem)]">
        {messages.map((message, index) => (
          <Message key={index} {...message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form 
        onSubmit={handleSubmit} 
        className="sticky bottom-0 left-0 right-0 border-t border-border bg-wikitok-dark/50 backdrop-blur-sm p-4"
      >
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Ask a question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1 bg-background/50 backdrop-blur-sm"
          />

          <Button 
            type="submit" 
            disabled={isLoading || !question.trim() || !apiKey.trim()}
            size="icon"
            className="hover:bg-primary/90 transition-colors"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ArticleAssistant;