import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Send, Key } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const useChatAssistant = (article: { title: string; content: string } | null) => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const askQuestion = async (question: string, apiKey: string) => {
    if (!article) return;
    
    setIsLoading(true);
    try {
      // Add user message immediately
      setMessages(prev => [...prev, { role: 'user', content: question }]);
  
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are a helpful assistant answering questions about the following Wikipedia article:
              Title: ${article.title}
              Content: ${article.content}`
            },
            {
              role: "user",
              content: question
            }
          ]
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const answer = data.choices[0].message.content;
      
      // Add assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: answer }]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get an answer. Please check your API key and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, isLoading, askQuestion };
};

// Animated Message component
const AnimatedWord = ({ word, delay }: { word: string; delay: number }) => (
  <motion.span
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay, duration: 0.2 }}
    className="inline-block mr-1"
  >
    {word}
  </motion.span>
);

const Message = ({ role, content }: { role: 'user' | 'assistant', content: string }) => {
  const words = content.split(' ');
  
  return (
    <div className={cn(
      "p-4 rounded-lg mb-4",
      role === 'user' 
        ? "bg-wikitok-red/10 ml-8" 
        : "bg-wikitok-blue/10 mr-8"
    )}>
      <div className="font-semibold mb-1">
        {role === 'user' ? 'You' : 'Assistant'}
      </div>
      <div className="text-sm text-gray-200">
        <AnimatePresence>
          {words.map((word, index) => (
            <AnimatedWord 
              key={index} 
              word={word} 
              delay={index * 0.1} 
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

const ArticleAssistant = ({ article }: { article: { title: string; content: string } | null }) => {
  const [question, setQuestion] = useState("");
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem("openai_api_key") || "";
  });
  const { messages, isLoading, askQuestion } = useChatAssistant(article);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem("openai_api_key", apiKey);
    }
  }, [apiKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  if (!article) return null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {messages.map((message, index) => (
          <Message key={index} {...message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-auto border-t border-border bg-wikitok-dark p-4">
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Ask a question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isLoading}
            className="flex-1"
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon">
                <Key className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-2">
                <h4 className="font-medium">Change API Key</h4>
                <Input
                  type="password"
                  placeholder="Enter your OpenAI API key..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="font-mono"
                />
              </div>
            </PopoverContent>
          </Popover>
          <Button 
            type="submit" 
            disabled={isLoading || !question.trim() || !apiKey.trim()}
            size="icon"
            onClick={handleSubmit}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ArticleAssistant;
