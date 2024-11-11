import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Send } from "lucide-react";
import { useToast } from "./ui/use-toast";

interface ArticleAssistantProps {
  article: {
    title: string;
    content: string;
  } | null;
}

const ArticleAssistant = ({ article }: ArticleAssistantProps) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!article || !question.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch("https://api.gptengineer.app/assistant/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
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

      if (!response.ok) throw new Error("Failed to get answer");
      
      const data = await response.json();
      setAnswer(data.message);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get an answer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!article) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Ask about this article</h3>
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
          disabled={isLoading || !question.trim()}
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