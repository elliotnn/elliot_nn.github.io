import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Send } from "lucide-react";
import { useToast } from "./ui/use-toast";

// Separate the chat logic into a custom hook for better organization
const useChatAssistant = (article: { title: string; content: string } | null) => {
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const askQuestion = async (question: string, apiKey: string) => {
    if (!article) return;
    
    setIsLoading(true);
    try {
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
              Content: ${article.content}
              
              Answer questions based only on the information provided in the article. If the answer cannot be found in the article, say so.`
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
      setAnswer(data.choices[0].message.content);
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

  return { answer, isLoading, askQuestion };
};

// Main component
const ArticleAssistant = ({ article }: { article: { title: string; content: string } | null }) => {
  const [question, setQuestion] = useState("");
  const [apiKey, setApiKey] = useState("");
  const { answer, isLoading, askQuestion } = useChatAssistant(article);

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
  };

  if (!article) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Ask about this article</h3>
      <div className="space-y-2">
        <Input
          type="password"
          placeholder="Enter your OpenAI API key..."
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="font-mono"
        />
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Ask a question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading || !question.trim() || !apiKey.trim()}
        >
          {isLoading ? (
            "Thinking..."
          ) : (
            <>
              Ask <Send className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </form>
      
      {answer && (
        <div className="mt-4">
          <Textarea
            value={answer}
            readOnly
            className="min-h-[200px] bg-muted"
          />
        </div>
      )}
    </div>
  );
};

export default ArticleAssistant;