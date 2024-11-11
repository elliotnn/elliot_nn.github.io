import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export const useChatAssistant = (article: { title: string; content: string } | null) => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const askQuestion = async (question: string, apiKey: string) => {
    if (!article) return;
    
    setIsLoading(true);
    try {
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
              content: `You are a helpful assistant answering questions about the following Wikipedia article. 
              Keep your responses concise and to the point, ideally under 3 sentences.
              When answering, try to reference specific parts of the article content when relevant.
              
              Title: ${article.title}
              Content: ${article.content}
              
              Current section being viewed: "${article.content.substring(0, 200)}..."`
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