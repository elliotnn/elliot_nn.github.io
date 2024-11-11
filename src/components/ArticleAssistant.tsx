import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Send } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { cn } from "@/lib/utils";

// Custom hook for chat logic
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

// Message component
const Message = ({ role, content }: { role: 'user' | 'assistant', content: string }) => (
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
      {content}
    </div>
  </div>
);

// Main component
const ArticleAssistant = ({ article }: { article: { title: string; content: string } | null }) => {
  const [question, setQuestion] = useState("");
  const [apiKey, setApiKey] = useState("");
  const { messages, isLoading, askQuestion } = useChatAssistant(article);

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
      <div className="mb-4">
        <Input
          type="password"
          placeholder="Enter your OpenAI API key..."
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="font-mono mb-2"
        />
      </div>

      <div className="flex-1 overflow-y-auto mb-4">
        {messages.map((message, index) => (
          <Message key={index} {...message} />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          placeholder="Ask a question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={isLoading}
          className="flex-1"
        />
        <Button 
          type="submit" 
          disabled={isLoading || !question.trim() || !apiKey.trim()}
          size="icon"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};

export default ArticleAssistant;